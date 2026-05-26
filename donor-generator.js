/**
 * Generates 20+ similar-blood donors localized to the searched city.
 */

const DONOR_FIRST_NAMES = [
  'Aarav', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Kavya', 'Arjun', 'Sneha',
  'Rohan', 'Isha', 'Aditya', 'Meera', 'Karan', 'Divya', 'Nikhil', 'Pooja',
  'Sanjay', 'Neha', 'Manish', 'Ritu', 'Deepak', 'Anjali', 'Suresh', 'Lakshmi',
  'Harish', 'Swati', 'Gaurav', 'Nidhi', 'Imran', 'Fatima', 'Joseph', 'Mary',
];

const DONOR_LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Mehta', 'Desai',
  'Iyer', 'Gupta', 'Khan', 'Joshi', 'Rao', 'Verma', 'Malhotra', 'Chopra',
  'Pillai', 'Bose', 'Das', 'Fernandes', 'Thomas', 'Ali', 'Kapoor', 'Saxena',
];

const CITY_AREAS = {
  mumbai: [
    'Andheri West', 'Bandra', 'Powai', 'Dadar', 'Worli', 'Thane', 'Borivali',
    'Malad', 'Goregaon', 'Chembur', 'Colaba', 'Juhu', 'Kandivali', 'Ghatkopar',
    'Mulund', 'Vashi', 'Nerul', 'Lower Parel', 'Santacruz', 'Kurla', 'Bhandup',
    'Dombivli', 'Panvel', 'Churchgate',
  ],
  delhi: [
    'Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar',
    'Pitampura', 'Janakpuri', 'Vasant Kunj', 'Nehru Place', 'Rajouri Garden',
    'Mayur Vihar', 'Hauz Khas', 'Greater Kailash', 'Shahdara', 'Model Town',
    'Paschim Vihar', 'Preet Vihar', 'Okhla', 'Civil Lines', 'Defence Colony',
    'Chandni Chowk', 'Noida Sector 18', 'Gurgaon Sector 29',
  ],
  bangalore: [
    'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'Jayanagar',
    'Malleshwaram', 'HSR Layout', 'Marathahalli', 'BTM Layout', 'Hebbal',
    'Yelahanka', 'Banashankari', 'Rajajinagar', 'Bellandur', 'Sarjapur Road',
    'MG Road', 'Domlur', 'Vijayanagar', 'Basavanagudi', 'JP Nagar', 'Ulsoor',
    'Mahadevapura', 'Hennur', 'Peenya',
  ],
  hyderabad: [
    'Gachibowli', 'Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Secunderabad',
    'Madhapur', 'Kukatpally', 'Ameerpet', 'LB Nagar', 'Uppal', 'Kondapur',
    'Miyapur', 'Begumpet', 'Charminar', 'Manikonda', 'Financial District',
    'Tolichowki', 'Alwal', 'Nacharam', 'Dilsukhnagar', 'Attapur', 'Kompally',
    'Shamshabad', 'Boduppal',
  ],
  chennai: [
    'T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR', 'Porur', 'Tambaram',
    'Mylapore', 'Nungambakkam', 'Guindy', 'Chromepet', 'Perungudi', 'Sholinganallur',
    'Egmore', 'Kodambakkam', 'Ambattur', 'Avadi', 'Pallavaram', 'ECR', 'Royapettah',
    'Kilpauk', 'Medavakkam', 'Thoraipakkam', 'Siruseri',
  ],
  kolkata: [
    'Salt Lake', 'Park Street', 'Howrah', 'Ballygunge', 'New Town', 'Dum Dum',
    'Behala', 'Gariahat', 'Rajarhat', 'Alipore', 'Tollygunge', 'Sealdah',
    'Jadavpur', 'Esplanade', 'Barrackpore', 'Kasba', 'Lake Town', 'Ultadanga',
    'Baguiati', 'Barasat', 'Sonarpur', 'Dakshineswar', 'Bhowanipore', 'Hatibagan',
  ],
  pune: [
    'Hinjewadi', 'Kothrud', 'Baner', 'Wakad', 'Viman Nagar', 'Koregaon Park',
    'Hadapsar', 'Aundh', 'Pimpri', 'Chinchwad', 'Kharadi', 'Magarpatta',
    'Deccan', 'Camp', 'Kalyani Nagar', 'Bavdhan', 'Pashan', 'Warje', 'Katraj',
    'Sinhgad Road', 'Yerwada', 'Lohegaon', 'Dhankawadi', 'Swargate',
  ],
};

const AVAILABILITY_POOL = ['available', 'available', 'available', 'week', 'week', 'month'];

function normalizeCityKey(city) {
  return city.trim().toLowerCase().replace(/\s+/g, '');
}

function getAreasForCity(city, count) {
  const key = normalizeCityKey(city);
  const matchedKey = Object.keys(CITY_AREAS).find((k) => key.includes(k) || k.includes(key));
  let areas = matchedKey ? [...CITY_AREAS[matchedKey]] : [];

  if (areas.length < count) {
    const suffixes = [
      'Central', 'North', 'South', 'East', 'West', 'Main Road', 'Station Road',
      'Market Area', 'Civil Lines', 'Industrial Area', 'Residential Zone',
      'City Center', 'Suburb', 'Extension', 'Colony', 'Nagar', 'Vihar', 'Enclave',
    ];
    suffixes.forEach((s, i) => areas.push(`${city} — ${s}`));
    for (let i = areas.length; areas.length < count; i++) {
      areas.push(`${city} — Sector ${i + 1}`);
    }
  }

  return shuffleArray(areas).slice(0, count);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getSimilarBloodGroups(recipientBlood) {
  const all = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const exact = [recipientBlood];
  const compatible = all.filter((bg) => bg !== recipientBlood && canDonateTo(bg, recipientBlood));
  return [...exact, ...compatible];
}

function randomPhone(seed) {
  const base = 9800000000 + (seed % 900000000);
  const s = String(base);
  return `+91 ${s.slice(0, 5)} ${s.slice(5)}`;
}

function randomPastDate(daysAgoMin, daysAgoMax) {
  const days = daysAgoMin + Math.floor(Math.random() * (daysAgoMax - daysAgoMin));
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Generate count donors with similar/compatible blood, all in the given city with different areas.
 */
function generateLocalizedDonors(targetBlood, city, count = 24) {
  if (!targetBlood || !city.trim()) return [];

  const cityDisplay = city.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  const areas = getAreasForCity(cityDisplay, count);
  const bloodTypes = getSimilarBloodGroups(targetBlood);
  const exactTypes = [targetBlood];
  const donors = [];
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    const first = DONOR_FIRST_NAMES[Math.floor(Math.random() * DONOR_FIRST_NAMES.length)];
    const last = DONOR_LAST_NAMES[Math.floor(Math.random() * DONOR_LAST_NAMES.length)];
    let name = `${first} ${last}`;
    let suffix = 1;
    while (usedNames.has(name)) {
      name = `${first} ${last} ${suffix++}`;
    }
    usedNames.add(name);

    const preferExact = i < Math.ceil(count * 0.7);
    const bloodGroup = preferExact
      ? targetBlood
      : bloodTypes[i % bloodTypes.length];

    const age = 19 + ((i * 3) % 42);
    const availability = AVAILABILITY_POOL[i % AVAILABILITY_POOL.length];
    const hasDonated = i % 4 !== 0;

    donors.push({
      id: `gen_${normalizeCityKey(city)}_${targetBlood.replace(/[+-]/g, '')}_${i}`,
      name,
      bloodGroup,
      phone: randomPhone(i * 137 + cityDisplay.length),
      age,
      city: cityDisplay,
      address: areas[i] || `${cityDisplay} Area ${i + 1}`,
      lastDonation: hasDonated ? randomPastDate(60, 400) : null,
      availability,
      registeredAt: new Date().toISOString(),
      generated: true,
      matchType: bloodGroup === targetBlood ? 'exact' : 'compatible',
    });
  }

  return donors.sort((a, b) => {
    const order = { exact: 0, compatible: 1 };
    const avail = { available: 0, week: 1, month: 2, unavailable: 3 };
    const typeDiff = (order[a.matchType] ?? 2) - (order[b.matchType] ?? 2);
    if (typeDiff !== 0) return typeDiff;
    return (avail[a.availability] ?? 4) - (avail[b.availability] ?? 4);
  });
}
