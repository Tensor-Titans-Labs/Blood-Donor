/**
 * Find Donors page — 24+ localized similar-blood recommendations
 */

const RECOMMEND_COUNT = 24;

function mergeDonorsForSearch(bloodGroup, city) {
  const cityTrim = city.trim();
  const registered = getRegisteredMatches(bloodGroup, cityTrim.toLowerCase());
  const recommended = generateLocalizedDonors(bloodGroup, cityTrim, RECOMMEND_COUNT);
  return { registered, recommended };
}

function renderDonorGrid(container, donors, options) {
  container.innerHTML = '';
  donors.forEach((donor) => {
    container.appendChild(
      createDonorCard(donor, {
        showCall: true,
        recommended: options.recommended,
        targetBlood: options.targetBlood,
      })
    );
  });
}

function searchDonors(e) {
  e.preventDefault();

  const bloodGroup = document.getElementById('search-blood').value;
  const cityInput = document.getElementById('search-city');
  const cityDisplay = cityInput.value.trim();

  if (!bloodGroup) {
    showToast('Please select a blood group.', 'error');
    return;
  }

  if (!cityDisplay) {
    showToast('Please enter a city to find donors near you.', 'error');
    cityInput.focus();
    return;
  }

  const user = Auth.getCurrentUser();
  if (user) Auth.addSearchToHistory(bloodGroup, cityDisplay);

  const { registered, recommended } = mergeDonorsForSearch(bloodGroup, cityDisplay);

  const recSection = document.getElementById('recommended-section');
  const recCards = document.getElementById('recommended-cards');
  const recDesc = document.getElementById('recommended-desc');
  const regSection = document.getElementById('registered-section');
  const regCards = document.getElementById('registered-cards');
  const noResults = document.getElementById('no-results');

  noResults.hidden = true;
  recSection.hidden = false;

  const exactCount = recommended.filter((d) => d.bloodGroup === bloodGroup).length;
  const compatCount = recommended.length - exactCount;

  recDesc.textContent = `${recommended.length} donors with similar blood (${exactCount} exact ${bloodGroup}, ${compatCount} compatible) — all located in ${cityDisplay} with different areas.`;

  renderDonorGrid(recCards, recommended, { recommended: true, targetBlood: bloodGroup });

  if (registered.length > 0) {
    regSection.hidden = false;
    document.getElementById('registered-count').textContent =
      `${registered.length} registered donor${registered.length !== 1 ? 's' : ''} from our community in ${cityDisplay}`;
    renderDonorGrid(regCards, registered, { recommended: false, targetBlood: bloodGroup });
  } else {
    regSection.hidden = true;
  }

  if (recommended.length === 0) {
    recSection.hidden = true;
    noResults.hidden = false;
    return;
  }

  recSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function prefillSearch() {
  const user = Auth.getCurrentUser();
  const searchBlood = document.getElementById('search-blood');
  const searchCity = document.getElementById('search-city');
  const findDesc = document.getElementById('find-donor-desc');
  const loginPrompt = document.getElementById('login-prompt');

  if (user) {
    if (loginPrompt) loginPrompt.hidden = true;
    const firstName = user.name.split(' ')[0];
    if (findDesc) {
      findDesc.textContent = `Hi ${firstName}! Enter blood type and city — we'll show 24+ similar donors in that location.`;
    }
    if (user.bloodGroup && searchBlood && !searchBlood.value) searchBlood.value = user.bloodGroup;
    if (user.city && searchCity && !searchCity.value) searchCity.value = user.city;
  } else if (loginPrompt) {
    loginPrompt.hidden = false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('blood') && searchBlood) searchBlood.value = params.get('blood');
  if (params.get('city') && searchCity) searchCity.value = params.get('city');

  if (searchBlood?.value && searchCity?.value) {
    searchDonors(new Event('submit'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search-form')?.addEventListener('submit', searchDonors);
  prefillSearch();
});
