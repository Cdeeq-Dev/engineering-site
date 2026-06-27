# NexVolt Engineering — Website + Client CRM + Checkout + Invoicing

Full-stack electrical contracting website built with Node.js + Express. Includes a client contact form that saves to a database, a password-protected admin dashboard with one-click Gmail/WhatsApp reply links, a checkout page with NGN/USD pricing, a card payment UI (not yet connected to a real processor), and auto-generated invoices with QR codes.

## Setup

```bash
npm install
npm start
```

Open **http://localhost:3000**. Admin login is at `/admin-login.html` — set your own `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `SESSION_SECRET` in `.env` before deploying anywhere public (never commit `.env`).

## Notes

- Client/invoice data lives in `db/data.json` — back it up regularly.
- Service prices and durations are in `services.js`.
- Payment is UI-only for now; see code comments in `server.js` to connect Paystack/Flutterwave.
- Free hosts (Render, Vercel, etc.) reset the filesystem on restart — swap `db.js` for a real hosted database before deploying live.