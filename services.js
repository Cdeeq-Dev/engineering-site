// services.js
// Single source of truth for service pricing, duration, and exchange rate.
// Edit the numbers below any time — every page (checkout + invoice) reads from here.

// Update this whenever the naira rate changes.
const USD_TO_NGN_RATE = 1550;

const SERVICES = [
  {
    id: 'industrial-installation',
    matchValue: 'Industrial Installation',
    name: 'Industrial Installation',
    icon: '⚡',
    description: 'Complete industrial electrical installation with precision and safety standards.',
    priceNGN: 9000000,
    days: 14,
  },
  {
    id: 'factory-wiring',
    matchValue: 'Factory Wiring',
    name: 'Factory Wiring',
    icon: '🏭',
    description: 'Comprehensive factory electrical wiring and distribution systems.',
    priceNGN: 6000000,
    days: 10,
  },
  {
    id: 'control-panel',
    matchValue: 'Control Panel Fabrication',
    name: 'Control Panel Fabrication',
    icon: '🎛️',
    description: 'Design and fabrication of advanced motor control panels.',
    priceNGN: 780000,
    days: 7,
  },
  {
    id: 'distribution-boards',
    matchValue: 'Distribution Boards',
    name: 'Distribution Boards',
    icon: '📦',
    description: 'DB installation and three-phase power systems.',
    priceNGN: 5600000,
    days: 5,
  },
  {
    id: 'estate-wiring',
    matchValue: 'Estate / Houses Wiring',
    name: 'Estate / Houses Wiring',
    icon: '🏠',
    description: 'Professional electrical wiring for residential estates.',
    priceNGN: 15000000,
    days: 20,
  },
  {
    id: 'maintenance',
    matchValue: 'Maintenance Service',
    name: 'Maintenance Service',
    icon: '🔧',
    description: 'Preventive maintenance and industrial troubleshooting services.',
    priceNGN: 1000000,
    month: 1,
  },
  {
    id: 'other',
    matchValue: 'Other',
    name: 'Custom Project',
    icon: '🛠️',
    description: 'Custom electrical engineering work scoped to your specific request.',
    //priceNGN: 200000,
    //days: 5,
  },
];

function usdFromNgn(ngn) {
  return Math.round((ngn / USD_TO_NGN_RATE) * 100) / 100;
}

function findServiceByMatchValue(value) {
  return SERVICES.find((s) => s.matchValue === value) || null;
}

function findServiceById(id) {
  return SERVICES.find((s) => s.id === id) || null;
}

module.exports = {
  SERVICES,
  USD_TO_NGN_RATE,
  usdFromNgn,
  findServiceByMatchValue,
  findServiceById,
};
