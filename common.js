/**
 * LifeLink — Shared utilities, UI, auth nav, donor storage
 */

const STORAGE_KEY = 'lifelink_donors';

function getDonors() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveDonors(donors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(donors));
}

function generateId() {
  return `donor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function updateDonorCount() {
  const el = document.getElementById('stat-donors');
  if (el) el.textContent = getDonors().length;
}

const AVAILABILITY_LABELS = {
  available: 'Available now',
  week: 'Available this week',
  month: 'Available this month',
  unavailable: 'Currently unavailable',
};

const CAN_DONATE_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

function canDonateTo(donorBlood, recipientBlood) {
  return (CAN_DONATE_TO[donorBlood] || []).includes(recipientBlood);
}

function formatDate(dateStr) {
  if (!dateStr) return 'Not recorded';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function bloodClass(group) {
  return `blood-${group}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function availabilityOrder(donor) {
  const order = { available: 0, week: 1, month: 2, unavailable: 3 };
  return order[donor.availability] ?? 4;
}

function createDonorCard(donor, options = {}) {
  const { showDelete = false, showCall = true, recommended = false, matchReason = '' } = options;
  const card = document.createElement('article');
  card.className = 'donor-card' + (recommended ? ' donor-card-recommended' : '');
  card.dataset.id = donor.id;

  const phoneLink = donor.phone.replace(/\s/g, '');
  const callBtn = showCall
    ? `<a href="tel:${phoneLink}" class="btn btn-primary">Call Donor</a>`
    : '';
  const deleteBtn = showDelete
    ? `<button type="button" class="btn btn-danger" data-delete="${donor.id}">Remove</button>`
    : '';

  const matchLabel =
    donor.matchType === 'exact'
      ? 'Exact blood match'
      : donor.matchType === 'compatible'
        ? `Compatible · can donate to ${options.targetBlood || 'recipient'}`
        : matchReason;

  const recommendBadge = recommended
    ? `<span class="recommend-badge">★ Recommended</span>${matchLabel ? `<p class="match-reason">${escapeHtml(matchLabel)}</p>` : ''}`
    : '';

  card.innerHTML = `
    ${recommendBadge}
    <div class="donor-card-header">
      <h3>${escapeHtml(donor.name)}</h3>
      <span class="blood-badge ${bloodClass(donor.bloodGroup)}">${donor.bloodGroup}</span>
    </div>
    <p class="donor-meta"><strong>City:</strong> ${escapeHtml(donor.city)}${donor.address ? ` · ${escapeHtml(donor.address)}` : ''}</p>
    <p class="donor-meta"><strong>Phone:</strong> ${escapeHtml(donor.phone)}</p>
    <p class="donor-meta"><strong>Age:</strong> ${donor.age} · <strong>Last donation:</strong> ${formatDate(donor.lastDonation)}</p>
    <span class="availability-tag availability-${donor.availability}">${AVAILABILITY_LABELS[donor.availability] || donor.availability}</span>
    <div class="donor-card-actions">${callBtn}${deleteBtn}</div>
  `;

  if (showDelete) {
    card.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (typeof onDeleteDonor === 'function') onDeleteDonor(donor.id);
    });
  }

  return card;
}

function initAuthUI() {
  const navGuest = document.getElementById('nav-guest');
  const navUser = document.getElementById('nav-user');
  if (!navGuest || !navUser) return;

  const user = Auth.getCurrentUser();

  if (user) {
    const role = Auth.getActiveRole();
    const firstName = user.name.split(' ')[0];
    navGuest.hidden = true;
    navUser.hidden = false;
    const nameEl = document.getElementById('nav-username');
    if (nameEl) nameEl.textContent = `${firstName} (${role === 'donor' ? 'Donor' : 'Finder'})`;
  } else {
    navGuest.hidden = false;
    navUser.hidden = true;
  }

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    Auth.logout();
    window.location.href = 'index.html';
  });
}

function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks?.classList.toggle('open');
  });

  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle?.classList.remove('active');
      navLinks?.classList.remove('open');
    });
  });

  const page = document.body.dataset.page;
  if (page) {
    navLinks?.querySelectorAll(`a[data-nav="${page}"]`).forEach((a) => a.classList.add('nav-active'));
  }
}

function seedSampleDonors() {
  if (localStorage.getItem('lifelink_seeded')) return;

  const samples = [
    { name: 'Priya Sharma', bloodGroup: 'O+', phone: '+91 98765 43210', age: 28, city: 'Mumbai', address: 'Andheri West', lastDonation: '2025-11-15', availability: 'available' },
    { name: 'Rahul Mehta', bloodGroup: 'A+', phone: '+91 91234 56789', age: 32, city: 'Mumbai', address: 'Bandra', lastDonation: '2025-09-20', availability: 'week' },
    { name: 'Anita Desai', bloodGroup: 'B-', phone: '+91 99887 76655', age: 24, city: 'Delhi', address: 'Connaught Place', lastDonation: null, availability: 'available' },
    { name: 'Vikram Singh', bloodGroup: 'O-', phone: '+91 97654 32109', age: 35, city: 'Bangalore', address: 'Koramangala', lastDonation: '2025-12-01', availability: 'month' },
  ].map((d) => ({
    ...d,
    id: generateId(),
    registeredAt: new Date().toISOString(),
  }));

  saveDonors(samples);
  localStorage.setItem('lifelink_seeded', 'true');
}

function getRegisteredMatches(bloodGroup, cityQuery) {
  let results = getDonors().filter((d) => d.bloodGroup === bloodGroup);
  if (cityQuery) {
    const q = cityQuery.toLowerCase();
    results = results.filter(
      (d) =>
        d.city.toLowerCase().includes(q) ||
        (d.address && d.address.toLowerCase().includes(q))
    );
  }
  return results.sort((a, b) => availabilityOrder(a) - availabilityOrder(b));
}

document.addEventListener('DOMContentLoaded', () => {
  seedSampleDonors();
  initAuthUI();
  initNavigation();
});
