/**
 * Become Donor page — registration form
 */

function handleDonorRegistration(e) {
  e.preventDefault();

  const form = e.target;
  const age = parseInt(form.age.value, 10);

  if (age < 18 || age > 65) {
    showToast('Age must be between 18 and 65 to register.', 'error');
    return;
  }

  const donor = {
    id: generateId(),
    name: form.name.value.trim(),
    bloodGroup: form['blood-group'].value,
    phone: form.phone.value.trim(),
    age,
    city: form.city.value.trim(),
    address: form.address.value.trim(),
    lastDonation: form['last-donation'].value || null,
    availability: form.availability.value,
    registeredAt: new Date().toISOString(),
  };

  const donors = getDonors();
  donors.push(donor);
  saveDonors(donors);

  form.reset();
  showToast(`Thank you, ${donor.name}! You are registered as a donor.`);
  renderMyDonors();
}

function deleteDonor(id) {
  if (!confirm('Remove this donor registration?')) return;
  saveDonors(getDonors().filter((d) => d.id !== id));
  showToast('Registration removed.');
  renderMyDonors();
}

window.onDeleteDonor = deleteDonor;

function renderMyDonors() {
  const section = document.getElementById('registered-donors');
  const list = document.getElementById('my-donor-list');
  if (!section || !list) return;

  const donors = getDonors();
  list.innerHTML = '';

  if (donors.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  donors.forEach((donor) => {
    list.appendChild(createDonorCard(donor, { showDelete: true, showCall: false }));
  });
}

function prefillDonorForm() {
  const user = Auth.getCurrentUser();
  const info = document.getElementById('donor-welcome');
  if (!user || !info) return;

  info.hidden = false;
  info.textContent = `Logged in as ${user.name}. Your details are pre-filled where possible.`;

  const form = document.getElementById('donor-form');
  if (!form) return;
  if (user.name && form.name) form.name.value = user.name;
  if (user.phone && form.phone) form.phone.value = user.phone;
  if (user.city && form.city) form.city.value = user.city;
  if (user.bloodGroup && form['blood-group']) form['blood-group'].value = user.bloodGroup;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('donor-form')?.addEventListener('submit', handleDonorRegistration);
  const lastDonationInput = document.getElementById('last-donation');
  if (lastDonationInput) {
    lastDonationInput.max = new Date().toISOString().split('T')[0];
  }
  renderMyDonors();
  prefillDonorForm();
});
