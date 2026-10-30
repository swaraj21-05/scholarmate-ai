const STORAGE_KEYS = {
  profile: 'scholarmate_profile',
  savedScholarships: 'scholarmate_saved_scholarships',
  selectedScholarship: 'scholarmate_selected_scholarship',
  documentStatuses: 'scholarmate_document_statuses',
  eligibilityHistory: 'scholarmate_eligibility_history',
  activityLog: 'scholarmate_activity_log',
  selectedProfile: 'scholarmate_selected_profile',
};

const DEMO_PROFILES = {
  eligible: {
    name: 'Aisha Verma',
    state: 'Karnataka',
    course: 'Computer Science',
    studyYear: '3',
    college: 'BMS College of Engineering',
    academicMarks: 91,
    annualFamilyIncome: 240000,
    specialCondition: 'Merit-based applicant with strong leadership involvement.'
  },
  ineligible: {
    name: 'Rohit Nair',
    state: 'Tamil Nadu',
    course: 'Business Administration',
    studyYear: '2',
    college: 'Madras Institute of Management',
    academicMarks: 71,
    annualFamilyIncome: 720000,
    specialCondition: 'No additional category condition.'
  },
  missing: {
    name: 'Meera Iyer',
    state: '',
    course: '',
    studyYear: '',
    college: 'National Institute of Applied Arts',
    academicMarks: '',
    annualFamilyIncome: '',
    specialCondition: 'First-generation student requesting support.'
  }
};

function getDefaultProfile() {
  return {
    name: '',
    state: '',
    course: '',
    studyYear: '',
    college: '',
    academicMarks: '',
    annualFamilyIncome: '',
    specialCondition: ''
  };
}

function getProfile() {
  const raw = localStorage.getItem(STORAGE_KEYS.profile);
  if (!raw) {
    return { ...getDefaultProfile(), ...DEMO_PROFILES.eligible };
  }
  try {
    return { ...getDefaultProfile(), ...JSON.parse(raw) };
  } catch {
    return { ...getDefaultProfile(), ...DEMO_PROFILES.eligible };
  }
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  addActivity('Profile saved');
}

function getSavedScholarships() {
  const raw = localStorage.getItem(STORAGE_KEYS.savedScholarships);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSavedScholarships(list) {
  localStorage.setItem(STORAGE_KEYS.savedScholarships, JSON.stringify(list));
}

function getSelectedScholarshipId() {
  return localStorage.getItem(STORAGE_KEYS.selectedScholarship) || '';
}

function setSelectedScholarshipId(id) {
  localStorage.setItem(STORAGE_KEYS.selectedScholarship, id);
}

function getSelectedScholarship() {
  const id = getSelectedScholarshipId();
  const list = getScholarships();
  return list.find(item => item.id === id) || null;
}

function getScholarships() {
  const cached = localStorage.getItem('scholarmate_scholarships_cache');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return [];
}

function setScholarships(list) {
  localStorage.setItem('scholarmate_scholarships_cache', JSON.stringify(list));
}

async function fetchScholarships() {
  if (getScholarships().length) {
    return getScholarships();
  }

  try {
    const res = await fetch('./data/scholarships.json');
    if (!res.ok) throw new Error('Scholarship data failed to load');
    const data = await res.json();
    setScholarships(data);
    return data;
  } catch (error) {
    console.error(error);
    const fallback = [
      {
        id: 'scholarship-demo-1',
        name: 'Merit Excellence Grant',
        provider: 'State Education Board',
        minMarks: 85,
        maxAnnualIncome: 400000,
        eligibleCourses: ['Computer Science', 'Engineering', 'Biotechnology'],
        eligibleStates: ['Karnataka', 'Tamil Nadu', 'Delhi'],
        requiredDocuments: ['Income certificate', 'Previous examination marksheet', 'Bonafide certificate'],
        additionalConditions: ['Must be in good academic standing and not receiving another state grant'],
        deadline: '2026-11-30',
        status: 'Demonstration data',
        sourceUrl: 'https://example.com/demo/merit-grant',
        demoStatus: 'Demonstration data - not an official scholarship'
      }
    ];
    setScholarships(fallback);
    return fallback;
  }
}

function addActivity(label) {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.activityLog) || '[]');
  current.unshift({
    label,
    time: new Date().toLocaleString()
  });
  localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(current.slice(0, 10)));
}

function getActivityLog() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.activityLog) || '[]');
}

function getDocumentStatuses() {
  const raw = localStorage.getItem(STORAGE_KEYS.documentStatuses);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveDocumentStatuses(statuses) {
  localStorage.setItem(STORAGE_KEYS.documentStatuses, JSON.stringify(statuses));
}

function getEligibilityHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.eligibilityHistory);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEligibilityHistory(items) {
  localStorage.setItem(STORAGE_KEYS.eligibilityHistory, JSON.stringify(items));
}

function getLastEligibilityResult() {
  const history = getEligibilityHistory();
  return history.length ? history[history.length - 1] : null;
}

function calculateProfileCompletion(profile) {
  const requiredFields = [
    'name',
    'state',
    'course',
    'studyYear',
    'college',
    'academicMarks',
    'annualFamilyIncome'
  ];
  const filled = requiredFields.filter(field => {
    const value = profile[field];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return Math.round((filled / requiredFields.length) * 100);
}

function formatCurrency(value) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
}

function formatDate(dateString) {
  if (!dateString) return 'No deadline';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function setFormMessage(element, message, type = 'success') {
  if (!element) return;
  element.textContent = message;
  element.className = 'form-message ' + type;
}

function getScholarshipById(id) {
  return getScholarships().find(item => item.id === id) || null;
}

function toggleSavedScholarship(scholarship, progress = 'Interested') {
  const current = getSavedScholarships();
  const existingIndex = current.findIndex(item => item.id === scholarship.id);

  if (existingIndex >= 0) {
    current[existingIndex].progress = progress;
    current[existingIndex].updatedAt = new Date().toISOString();
  } else {
    current.push({
      ...scholarship,
      progress,
      savedAt: new Date().toISOString()
    });
  }

  saveSavedScholarships(current);
  addActivity(`${scholarship.name} saved to tracker`);
  return current;
}

function updateProgressForScholarship(id, progress) {
  const current = getSavedScholarships();
  const index = current.findIndex(item => item.id === id);
  if (index >= 0) {
    current[index].progress = progress;
    current[index].updatedAt = new Date().toISOString();
    saveSavedScholarships(current);
    addActivity(`${current[index].name} updated to ${progress}`);
  }
}

function showLoadingMessage(element, message = 'Loading data...') {
  if (!element) return;
  element.innerHTML = `<div class="empty-state">${message}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem(STORAGE_KEYS.savedScholarships)) {
    localStorage.setItem(STORAGE_KEYS.savedScholarships, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.activityLog)) {
    localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.eligibilityHistory)) {
    localStorage.setItem(STORAGE_KEYS.eligibilityHistory, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.selectedScholarship) && getScholarships().length) {
    localStorage.setItem(STORAGE_KEYS.selectedScholarship, getScholarships()[0].id);
  }
});
