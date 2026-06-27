// checkout.js
// Loads services from the backend, pre-selects the one the client asked about
// in their contact form, and handles the (demo) payment flow + invoice creation.

const params = new URLSearchParams(window.location.search);
const clientId = params.get('clientId');

let services = [];
let selectedService = null;
let clientInfo = null;

const serviceGrid = document.getElementById('serviceGrid');
const orderSummary = document.getElementById('orderSummary');
const checkoutSubtitle = document.getElementById('checkoutSubtitle');

init();

async function init() {
    await loadServices();

    if (clientId) {
        await loadClient(clientId);
    }

    renderServiceCards();

    if (clientInfo) {
        const matched = services.find((s) => s.matchValue === clientInfo.service);
        if (matched) {
            selectService(matched.id, { silent: true });
            checkoutSubtitle.textContent = `Based on your request, we've highlighted "${matched.name}" below — feel free to change it.`;
        }
    }
}

async function loadServices() {
    const res = await fetch('/api/services');
    const data = await res.json();
    services = data.services;
}

async function loadClient(id) {
    try {
        const res = await fetch(`/api/clients/${encodeURIComponent(id)}`);
        if (!res.ok) return;
        const data = await res.json();
        clientInfo = data.client;
    } catch (err) {
        console.warn('Could not load client info', err);
    }
}

function renderServiceCards() {
    serviceGrid.innerHTML = '';
    services.forEach((service) => {
        const isRecommended = clientInfo && clientInfo.service === service.matchValue;
        const card = document.createElement('div');
        card.className = 'checkout-card' + (isRecommended ? ' recommended' : '');
        card.dataset.serviceId = service.id;
        card.innerHTML = `
            <div class="checkout-card-icon">${service.icon}</div>
            <h3>${service.name}</h3>
            <p class="desc">${service.description}</p>
            <span class="days-badge">⏱ ${service.days} day${service.days > 1 ? 's' : ''}</span>
            <div class="price-row">
                <span class="price-ngn">₦${service.priceNGN.toLocaleString()}</span>
                <span class="price-usd">($${service.priceUSD.toFixed(2)})</span>
            </div>
        `;
        card.addEventListener('click', () => selectService(service.id));
        serviceGrid.appendChild(card);
    });
}

function selectService(serviceId, opts = {}) {
    selectedService = services.find((s) => s.id === serviceId);
    if (!selectedService) return;

    document.querySelectorAll('.checkout-card').forEach((el) => {
        el.classList.toggle('selected', el.dataset.serviceId === serviceId);
    });

    updateOrderSummary();

    if (!opts.silent) {
        orderSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        orderSummary.style.display = 'block';
    }
}

function updateOrderSummary() {
    if (!selectedService) return;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + selectedService.days);

    document.getElementById('summaryService').textContent = `${selectedService.icon} ${selectedService.name}`;
    document.getElementById('summaryDays').textContent = `${selectedService.days} day${selectedService.days > 1 ? 's' : ''}`;
    document.getElementById('summaryStart').textContent = startDate.toDateString();
    document.getElementById('summaryEnd').textContent = endDate.toDateString();
    document.getElementById('summaryNGN').textContent = `₦${selectedService.priceNGN.toLocaleString()}`;
    document.getElementById('summaryUSD').textContent = `($${selectedService.priceUSD.toFixed(2)})`;
    document.getElementById('paymentAmountLabel').textContent = `₦${selectedService.priceNGN.toLocaleString()}`;

    orderSummary.style.display = 'block';
}

// ---------- Payment Modal ----------

const paymentModalOverlay = document.getElementById('paymentModalOverlay');
const processingModalOverlay = document.getElementById('processingModalOverlay');
const paymentForm = document.getElementById('paymentForm');

document.getElementById('payNowBtn').addEventListener('click', () => {
    if (!selectedService) {
        alert('Please select a service first.');
        return;
    }
    paymentModalOverlay.classList.add('active');
});

document.getElementById('closePaymentModal').addEventListener('click', () => {
    paymentModalOverlay.classList.remove('active');
});
document.getElementById('cancelPaymentBtn').addEventListener('click', () => {
    paymentModalOverlay.classList.remove('active');
});

// ---------- Input formatting helpers ----------

const cardNumberInput = document.getElementById('cardNumber');
cardNumberInput.addEventListener('input', () => {
    let digits = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
    cardNumberInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
});

const cardExpiryInput = document.getElementById('cardExpiry');
cardExpiryInput.addEventListener('input', () => {
    let digits = cardExpiryInput.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) {
        digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    cardExpiryInput.value = digits;
});

const cardCvvInput = document.getElementById('cardCvv');
cardCvvInput.addEventListener('input', () => {
    cardCvvInput.value = cardCvvInput.value.replace(/\D/g, '').slice(0, 3);
});

// ---------- Submit (demo) payment ----------

paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedService) return;

    const cardName = document.getElementById('cardName').value.trim();

    paymentModalOverlay.classList.remove('active');
    processingModalOverlay.classList.add('active');

    try {
        const res = await fetch('/api/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: clientId || null,
                serviceId: selectedService.id,
                clientName: clientInfo ? clientInfo.organization : cardName,
                cardName,
            }),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Payment failed.');
        }

        // Simulate brief processing time for realism, then go to invoice
        setTimeout(() => {
            window.location.href = `invoice.html?invoiceId=${encodeURIComponent(data.invoiceId)}`;
        }, 900);
    } catch (err) {
        processingModalOverlay.classList.remove('active');
        alert('Payment could not be completed: ' + err.message);
    }
});
