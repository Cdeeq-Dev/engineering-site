// server.js
// NexVolt Engineering Ltd - backend server
// Handles: contact form submission, admin login + dashboard, checkout/pricing,
// invoice creation + lookup, and QR code generation for invoices.

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const QRCode = require('qrcode');

const db = require('./db');
const {
  SERVICES,
  USD_TO_NGN_RATE,
  usdFromNgn,
  findServiceByMatchValue,
  findServiceById,
} = require('./services');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Admin credentials ----------
// CHANGE THESE before you put this anywhere public.
// Set them via a .env file (ADMIN_USERNAME / ADMIN_PASSWORD) so they aren't hardcoded.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nexvolt2026';

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'nexvolt-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
  })
);
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.redirect('/admin-login.html');
}

// Protect the admin.html page itself — this MUST be registered before
// express.static, otherwise static file serving would hand out admin.html
// to anyone who asks, without ever checking the session.
app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve all other static files (CSS, JS, images, the rest of the HTML pages).
// admin.html is excluded here since it's already handled above.
app.use(
  express.static(path.join(__dirname, 'public'), {
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('admin.html')) {
        // Should never actually be served from here, but block just in case.
        res.status(404);
      }
    },
  })
);

// =======================================================
// PUBLIC API: Contact form
// =======================================================

app.post('/api/contact', async (req, res) => {
  try {
    const { organization, email, phone, service, message } = req.body;
    if (!organization || !email || !phone || !service || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const client = await db.addClient({ organization, email, phone, service, message });
    res.json({ success: true, clientId: client.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong saving your message.' });
  }
});

// =======================================================
// PUBLIC API: Services / pricing (for checkout page)
// =======================================================

app.get('/api/services', (req, res) => {
  const data = SERVICES.map((s) => ({
    ...s,
    priceUSD: usdFromNgn(s.priceNGN),
  }));
  res.json({ services: data, rate: USD_TO_NGN_RATE });
});

// Look up a client's submission, used by checkout.html to pre-select their service
app.get('/api/clients/:id', async (req, res) => {
  const client = await db.getClientById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found.' });
  res.json({ client });
});

// =======================================================
// PUBLIC API: "Payment" (UI placeholder — no real charge)
// =======================================================

app.post('/api/pay', async (req, res) => {
  try {
    const { clientId, serviceId, clientName, cardName } = req.body;

    const service = findServiceById(serviceId);
    if (!service) return res.status(400).json({ error: 'Invalid service selected.' });

    const client = clientId ? await db.getClientById(clientId) : null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3); // work starts 3 days after payment
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + service.days);

    const invoice = await db.addInvoice({
      clientId: client ? client.id : null,
      clientName: clientName || (client ? client.organization : 'Valued Client'),
      cardName: cardName || '',
      serviceId: service.id,
      serviceName: service.name,
      priceNGN: service.priceNGN,
      priceUSD: usdFromNgn(service.priceNGN),
      days: service.days,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'paid', // placeholder — this is a UI-only mock payment, not a real charge
    });

    if (client) {
      await db.updateClientStatus(client.id, 'paid');
    }

    res.json({ success: true, invoiceId: invoice.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not process payment.' });
  }
});

// =======================================================
// PUBLIC API: Invoice lookup + QR code
// =======================================================

app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await db.getInvoiceById(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
  res.json({ invoice });
});

app.get('/api/invoices/:id/qrcode', async (req, res) => {
  const invoice = await db.getInvoiceById(req.params.id);
  if (!invoice) return res.status(404).send('Invoice not found.');

  const verifyText = [
    `NexVolt Engineering Ltd`,
    `Invoice: ${invoice.invoiceNumber}`,
    `Client: ${invoice.clientName}`,
    `Service: ${invoice.serviceName}`,
    `Amount: NGN ${invoice.priceNGN.toLocaleString()}`,
    `Start: ${new Date(invoice.startDate).toDateString()}`,
    `End: ${new Date(invoice.endDate).toDateString()}`,
  ].join('\n');

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyText, { margin: 1, width: 200 });
    const img = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    res.set('Content-Type', 'image/png');
    res.send(img);
  } catch (err) {
    console.error(err);
    res.status(500).send('Could not generate QR code.');
  }
});

// =======================================================
// ADMIN: Login / logout
// =======================================================

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid username or password.' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/admin/me', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// =======================================================
// ADMIN: Protected dashboard data
// =======================================================

app.get('/api/admin/clients', requireAdmin, async (req, res) => {
  const clients = await db.getClients();
  res.json({ clients });
});

app.get('/api/admin/invoices', requireAdmin, async (req, res) => {
  const invoices = await db.getAllInvoices();
  res.json({ invoices });
});

app.post('/api/admin/clients/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  const client = await db.updateClientStatus(req.params.id, status);
  if (!client) return res.status(404).json({ error: 'Client not found.' });
  res.json({ success: true, client });
});

// =======================================================
// Start server
// =======================================================

db.initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  NexVolt Engineering server running:`);
    console.log(`  → Website:        http://localhost:${PORT}`);
    console.log(`  → Admin login:    http://localhost:${PORT}/admin-login.html`);
    console.log(`  → Admin user:     ${ADMIN_USERNAME}`);
    console.log(`  → Admin password: ${ADMIN_PASSWORD}`);
    console.log(`  (Change these in a .env file before going live)\n`);
  });
});
