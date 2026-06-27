// db.js
// A small, transparent, file-based database — no external DB engine required.
// Data lives in db/data.json and survives server restarts.
// Writes are synchronous and atomic (write to a temp file, then rename),
// so the data file is never left half-written even if the process crashes.
// You can open db/data.json directly in any text editor to see your data.
//
// This is a real persistence layer (not browser storage) and is easy to
// swap for Postgres/MySQL later if NexVolt ever needs to scale up.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.join(__dirname, 'db');
const DB_FILE = path.join(DB_DIR, 'data.json');

let state = { clients: [], invoices: [] };

function ensureDbFile() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  }
}

function loadFromDisk() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    state = {
      clients: parsed.clients || [],
      invoices: parsed.invoices || [],
    };
  } catch (err) {
    console.error('Could not read database file, starting fresh:', err.message);
    state = { clients: [], invoices: [] };
  }
}

function saveToDisk() {
  const tmpFile = DB_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2));
  fs.renameSync(tmpFile, DB_FILE); // atomic on POSIX filesystems
}

function newId(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

async function initDB() {
  loadFromDisk();
}

// ---------- Clients ----------

async function addClient({ organization, email, phone, service, message }) {
  const client = {
    id: newId('client'),
    organization,
    email,
    phone,
    service,
    message,
    status: 'new', // new -> contacted -> checkout -> paid
    createdAt: new Date().toISOString(),
  };
  state.clients.push(client);
  saveToDisk();
  return client;
}

async function getClients() {
  return [...state.clients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getClientById(id) {
  return state.clients.find((c) => c.id === id) || null;
}

async function updateClientStatus(id, status) {
  const client = state.clients.find((c) => c.id === id);
  if (client) {
    client.status = status;
    saveToDisk();
  }
  return client;
}

// ---------- Invoices ----------

async function addInvoice(invoice) {
  const record = {
    id: newId('inv'),
    invoiceNumber: `NXV-${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString(),
    ...invoice,
  };
  state.invoices.push(record);
  saveToDisk();
  return record;
}

async function getInvoiceById(id) {
  return state.invoices.find((i) => i.id === id) || null;
}

async function getInvoicesByClientId(clientId) {
  return state.invoices.filter((i) => i.clientId === clientId);
}

async function getAllInvoices() {
  return [...state.invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  initDB,
  addClient,
  getClients,
  getClientById,
  updateClientStatus,
  addInvoice,
  getInvoiceById,
  getInvoicesByClientId,
  getAllInvoices,
};
