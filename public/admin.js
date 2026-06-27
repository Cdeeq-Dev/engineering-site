// admin.js
// Powers the admin dashboard: loads clients + invoices, renders tables,
// and builds one-click reply links for Gmail and WhatsApp.

init();

async function init() {
    // Confirm the session is valid (in case someone navigates here with an old tab)
    const meRes = await fetch('/api/admin/me');
    const me = await meRes.json();
    if (!me.isAdmin) {
        window.location.href = 'admin-login.html';
        return;
    }

    setupTabs();
    loadClients();
    loadInvoices();

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = 'admin-login.html';
    });
}

function setupTabs() {
    document.querySelectorAll('.admin-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.getElementById('clientsTab').style.display = target === 'clients' ? 'block' : 'none';
            document.getElementById('invoicesTab').style.display = target === 'invoices' ? 'block' : 'none';
        });
    });
}

// ---------- Clients ----------

async function loadClients() {
    const tbody = document.getElementById('clientsTableBody');
    try {
        const res = await fetch('/api/admin/clients');
        const data = await res.json();
        const clients = data.clients || [];

        renderStats(clients);

        if (clients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No client messages yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = clients.map(clientRowHtml).join('');

        // wire up status dropdowns
        tbody.querySelectorAll('.status-select').forEach((select) => {
            select.addEventListener('change', async () => {
                const id = select.dataset.clientId;
                await fetch(`/api/admin/clients/${encodeURIComponent(id)}/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: select.value }),
                });
                loadClients();
            });
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Could not load clients: ${err.message}</td></tr>`;
    }
}

function renderStats(clients) {
    const statsEl = document.getElementById('clientStats');
    const total = clients.length;
    const newCount = clients.filter((c) => c.status === 'new').length;
    const paidCount = clients.filter((c) => c.status === 'paid').length;

    statsEl.innerHTML = `
        <div class="admin-stat-card"><div class="num">${total}</div><div class="label">Total Messages</div></div>
        <div class="admin-stat-card"><div class="num">${newCount}</div><div class="label">New / Unread</div></div>
        <div class="admin-stat-card"><div class="num">${paidCount}</div><div class="label">Paid Clients</div></div>
    `;
}

function clientRowHtml(client) {
    const date = new Date(client.createdAt);
    const gmailLink = buildGmailLink(client);
    const whatsappLink = buildWhatsAppLink(client);

    return `
        <tr>
            <td>${date.toLocaleDateString()}<br><small>${date.toLocaleTimeString()}</small></td>
            <td><strong>${escapeHtml(client.organization)}</strong></td>
            <td>${escapeHtml(client.email)}<br>${escapeHtml(client.phone)}</td>
            <td>${escapeHtml(client.service)}</td>
            <td class="message-cell">${escapeHtml(client.message)}</td>
            <td>
                <select class="status-select" data-client-id="${client.id}">
                    ${['new', 'contacted', 'checkout', 'paid'].map(
                        (s) => `<option value="${s}" ${s === client.status ? 'selected' : ''}>${capitalize(s)}</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <div class="action-btns">
                    <a class="action-btn gmail" href="${gmailLink}" target="_blank" rel="noopener">📧 Reply on Gmail</a>
                    <a class="action-btn whatsapp" href="${whatsappLink}" target="_blank" rel="noopener">💬 Reply on WhatsApp</a>
                </div>
            </td>
        </tr>
    `;
}

function buildGmailLink(client) {
    const subject = encodeURIComponent(`Re: Your enquiry about ${client.service}`);
    const body = encodeURIComponent(
        `Hello ${client.organization},\n\nThank you for reaching out to NexVolt Engineering regarding ${client.service}.\n\n`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(client.email)}&su=${subject}&body=${body}`;
}

function buildWhatsAppLink(client) {
    const digits = client.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
    const text = encodeURIComponent(
        `Hello ${client.organization}, this is NexVolt Engineering following up on your enquiry about ${client.service}.`
    );
    return `https://wa.me/${digits}?text=${text}`;
}

// ---------- Invoices ----------

async function loadInvoices() {
    const tbody = document.getElementById('invoicesTableBody');
    try {
        const res = await fetch('/api/admin/invoices');
        const data = await res.json();
        const invoices = data.invoices || [];

        if (invoices.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No invoices yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = invoices.map(invoiceRowHtml).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Could not load invoices: ${err.message}</td></tr>`;
    }
}

function invoiceRowHtml(invoice) {
    const start = new Date(invoice.startDate);
    const end = new Date(invoice.endDate);
    return `
        <tr>
            <td><strong>${invoice.invoiceNumber}</strong></td>
            <td>${escapeHtml(invoice.clientName)}</td>
            <td>${escapeHtml(invoice.serviceName)}</td>
            <td>₦${invoice.priceNGN.toLocaleString()}<br><small>$${invoice.priceUSD.toFixed(2)}</small></td>
            <td>${start.toLocaleDateString()} → ${end.toLocaleDateString()}</td>
            <td><span class="status-pill status-paid">${escapeHtml(invoice.status)}</span></td>
            <td>
                <a class="action-btn view" href="invoice.html?invoiceId=${encodeURIComponent(invoice.id)}" target="_blank">🧾 View / Print</a>
            </td>
        </tr>
    `;
}

// ---------- Utils ----------

function escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
