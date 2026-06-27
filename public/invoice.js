// invoice.js
// Loads an invoice by ID from the backend and renders a printable invoice card.

const params = new URLSearchParams(window.location.search);
const invoiceId = params.get('invoiceId');

const invoiceCard = document.getElementById('invoiceCard');

init();

async function init() {
    if (!invoiceId) {
        invoiceCard.innerHTML = `<p style="text-align:center;color:#b91c1c;">No invoice specified.</p>`;
        return;
    }

    try {
        const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`);
        if (!res.ok) throw new Error('Invoice not found.');
        const data = await res.json();
        renderInvoice(data.invoice);

        // Prompt the user to print shortly after the invoice renders
        setTimeout(() => {
            const wantsPrint = confirm('Your invoice is ready. Would you like to print it now?');
            if (wantsPrint) {
                window.print();
            }
        }, 600);
    } catch (err) {
        invoiceCard.innerHTML = `<p style="text-align:center;color:#b91c1c;">Could not load invoice: ${err.message}</p>`;
    }
}

function renderInvoice(invoice) {
    const startDate = new Date(invoice.startDate);
    const endDate = new Date(invoice.endDate);
    const issuedDate = new Date(invoice.createdAt);

    invoiceCard.innerHTML = `
        <div class="invoice-header">
            <div class="invoice-brand">
                <div class="invoice-brand-icon">⚡</div>
                <div>
                    <h2>NexVolt Engineering Ltd</h2>
                    <p>No 8 Hadejia Road, Kano State, Nigeria</p>
                    <p>abubakarbellosdk@gmail.com · +234 916 647 9239</p>
                </div>
            </div>
            <div class="invoice-meta">
                <h1>INVOICE</h1>
                <p><strong>${invoice.invoiceNumber}</strong></p>
                <p>Issued: ${issuedDate.toDateString()}</p>
                <span class="invoice-status">PAID</span>
            </div>
        </div>

        <div class="invoice-parties">
            <div>
                <h4>Billed To</h4>
                <p><strong>${escapeHtml(invoice.clientName)}</strong></p>
            </div>
            <div style="text-align:right;">
                <h4>Project Timeline</h4>
                <p>Start: <strong>${startDate.toDateString()}</strong></p>
                <p>Completion: <strong>${endDate.toDateString()}</strong></p>
            </div>
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Duration</th>
                    <th class="amount-cell">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${escapeHtml(invoice.serviceName)}</td>
                    <td>${invoice.days} day${invoice.days > 1 ? 's' : ''}</td>
                    <td class="amount-cell">₦${invoice.priceNGN.toLocaleString()}</td>
                </tr>
            </tbody>
        </table>

        <div class="invoice-totals">
            <div class="row">
                <span>Subtotal</span>
                <span>₦${invoice.priceNGN.toLocaleString()}</span>
            </div>
            <div class="row">
                <span>USD Equivalent</span>
                <span>$${invoice.priceUSD.toFixed(2)}</span>
            </div>
            <div class="row grand">
                <span>Total Paid</span>
                <span>₦${invoice.priceNGN.toLocaleString()}</span>
            </div>
        </div>

        <div class="invoice-footer">
            <div class="invoice-qr-block">
                <img src="/api/invoices/${encodeURIComponent(invoice.id)}/qrcode" alt="Invoice QR Code">
                <p>Scan to verify invoice</p>
            </div>
            <div class="invoice-stamp-block">
                <div class="invoice-stamp">
                    <div class="invoice-stamp-inner">
                        <div class="stamp-title">NEXVOLT</div>
                        <div class="stamp-sub">ENGINEERING LTD</div>
                        <div class="stamp-sub">✓ PAID</div>
                    </div>
                </div>
            </div>
        </div>

        <p class="invoice-thanks">Thank you for choosing NexVolt Engineering Ltd. We look forward to delivering quality work on this project.</p>
    `;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
});
