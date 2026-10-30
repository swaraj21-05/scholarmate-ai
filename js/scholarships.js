document.addEventListener('DOMContentLoaded', async () => {
  const listContainer = document.getElementById('scholarship-list');
  if (!listContainer) return;

  const searchInput = document.getElementById('scholarship-search');
  const courseFilter = document.getElementById('course-filter');
  const stateFilter = document.getElementById('state-filter');
  const sortSelect = document.getElementById('sort-select');

  const scholarships = await fetchScholarships();

  function populateFilters(items) {
    const courses = [...new Set(items.flatMap(item => item.eligibleCourses || []))].sort();
    const states = [...new Set(items.flatMap(item => item.eligibleStates || []))].sort();

    courseFilter.innerHTML = '<option value="">All courses</option>' +
      courses.map(course => `<option value="${course}">${course}</option>`).join('');

    stateFilter.innerHTML = '<option value="">All states</option>' +
      states.map(state => `<option value="${state}">${state}</option>`).join('');
  }

  function applyFilters() {
    const term = searchInput.value.trim().toLowerCase();
    const selectedCourse = courseFilter.value;
    const selectedState = stateFilter.value;
    const sortBy = sortSelect.value;

    const filtered = [...scholarships].filter(item => {
      const query = `${item.name} ${item.provider}`.toLowerCase();
      const matchesSearch = !term || query.includes(term);
      const matchesCourse = !selectedCourse || (item.eligibleCourses || []).includes(selectedCourse);
      const matchesState = !selectedState || (item.eligibleStates || []).includes(selectedState);

      return matchesSearch && matchesCourse && matchesState;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'minMarks') return Number(b.minMarks) - Number(a.minMarks);
      return new Date(a.deadline) - new Date(b.deadline);
    });

    renderCards(filtered);
  }

  function renderCards(items) {
    if (!items.length) {
      listContainer.innerHTML = '<div class="empty-state">No scholarships match the current filters.</div>';
      return;
    }

    listContainer.innerHTML = items.map(item => {
      const saved = getSavedScholarships().some(savedItem => savedItem.id === item.id);

      return `
        <article class="scholarship-card">
          <div class="card-top">
            <div>
              <h3>${item.name}</h3>
              <div class="card-provider">${item.provider}</div>
            </div>
            <span class="badge badge-neutral">${item.demoStatus || 'Demonstration data'}</span>
          </div>

          <div class="meta-row">
            <span class="meta-chip">Min marks: ${item.minMarks}%</span>
            <span class="meta-chip">Income: ${item.maxAnnualIncome ? formatCurrency(item.maxAnnualIncome) : 'N/A'}</span>
          </div>

          <div class="meta-row">
            <span class="meta-chip">Course: ${Array.isArray(item.eligibleCourses) ? item.eligibleCourses.join(', ') : item.eligibleCourses || 'Any'}</span>
          </div>

          <div class="meta-row">
            <span class="meta-chip">States: ${Array.isArray(item.eligibleStates) ? item.eligibleStates.join(', ') : item.eligibleStates || 'Any'}</span>
          </div>

          <p>${item.additionalConditions ? item.additionalConditions[0] : 'No additional conditions provided.'}</p>

          <ul class="detail-list">
            <li><span>Deadline</span><strong>${formatDate(item.deadline)}</strong></li>
            <li><span>Documents</span><strong>${(item.requiredDocuments || []).length}</strong></li>
            <li><span>Status</span><strong>${item.status || 'Demonstration'}</strong></li>
          </ul>

          <div class="card-actions">
            <button class="button button-primary" data-action="select-scholarship" data-id="${item.id}">
              Use for Eligibility
            </button>
            <button class="button button-secondary" data-action="save-scholarship" data-id="${item.id}">
              ${saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </article>
      `;
    }).join('');

    listContainer.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', (event) => {
        const { action, id } = event.currentTarget.dataset;
        const scholarship = scholarships.find(item => item.id === id);

        if (!scholarship) return;

        if (action === 'select-scholarship') {
          setSelectedScholarshipId(scholarship.id);
          addActivity(`Selected scholarship: ${scholarship.name}`);
          window.location.href = './eligibility.html';
        }

        if (action === 'save-scholarship') {
          toggleSavedScholarship(scholarship, 'Interested');
          applyFilters();
        }
      });
    });
  }

  populateFilters(scholarships);
  applyFilters();

  searchInput.addEventListener('input', applyFilters);
  courseFilter.addEventListener('change', applyFilters);
  stateFilter.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
});
