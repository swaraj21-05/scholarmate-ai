document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form');
  if (!form) return;

  const demoSelect = document.getElementById('demo-profile');
  const fieldMap = {
    name: document.getElementById('name'),
    state: document.getElementById('state'),
    course: document.getElementById('course'),
    studyYear: document.getElementById('studyYear'),
    college: document.getElementById('college'),
    academicMarks: document.getElementById('academicMarks'),
    annualFamilyIncome: document.getElementById('annualFamilyIncome'),
    specialCondition: document.getElementById('specialCondition')
  };

  function populateProfile(profile) {
    Object.entries(fieldMap).forEach(([key, input]) => {
      if (!input) return;
      input.value = profile[key] ?? '';
    });
  }

  function validateProfile(data) {
    const issues = [];

    if (!data.name || data.name.trim().length < 2) issues.push('Name is required.');
    if (!data.state) issues.push('State is required.');
    if (!data.course) issues.push('Course is required.');
    if (!data.studyYear) issues.push('Study year is required.');
    if (!data.college || data.college.trim().length < 2) issues.push('College is required.');
    if (data.academicMarks === '' || Number(data.academicMarks) < 0 || Number(data.academicMarks) > 100) {
      issues.push('Academic marks must be between 0 and 100.');
    }
    if (data.annualFamilyIncome === '' || Number(data.annualFamilyIncome) < 0) {
      issues.push('Annual family income must be a valid positive number.');
    }

    return issues;
  }

  const profile = getProfile();
  populateProfile(profile);

  demoSelect.addEventListener('change', (event) => {
    const chosen = DEMO_PROFILES[event.target.value];
    if (chosen) {
      populateProfile(chosen);
      setFormMessage(document.getElementById('profile-message'), 'Demo profile loaded. Save to continue.', 'success');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      name: fieldMap.name.value.trim(),
      state: fieldMap.state.value,
      course: fieldMap.course.value,
      studyYear: fieldMap.studyYear.value,
      college: fieldMap.college.value.trim(),
      academicMarks: fieldMap.academicMarks.value,
      annualFamilyIncome: fieldMap.annualFamilyIncome.value,
      specialCondition: fieldMap.specialCondition.value.trim()
    };

    const issues = validateProfile(data);
    if (issues.length) {
      setFormMessage(document.getElementById('profile-message'), issues.join(' '), 'error');
      return;
    }

    saveProfile(data);
    setFormMessage(document.getElementById('profile-message'), 'Profile saved successfully.', 'success');
    addActivity('Student profile updated');
  });

  document.getElementById('clear-profile').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.profile);
    populateProfile(getDefaultProfile());
    setFormMessage(document.getElementById('profile-message'), 'Profile reset to blank.', 'success');
  });
});
