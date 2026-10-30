document.addEventListener('DOMContentLoaded', () => {
  const scholarshipSelect = document.getElementById('document-scholarship');
  const checklistContainer = document.getElementById('document-checklist');

  if (!scholarshipSelect || !checklistContainer) return;

  function populateScholarships() {
    const scholarships = getScholarships();
    const selectedId = getSelectedScholarshipId();
    scholarshipSelect.innerHTML = scholarships.map(item => `
      <option value="${item.id}" ${selectedId === item.id ? 'selected' : ''}>${item.name}</option>
    `).join('');

    if (!selectedId && scholarships.length) {
      setSelectedScholarshipId(scholarships[0].id);
    }
  }

  function getStatusesForScholarship(scholarshipId) {
    const all = getDocumentStatuses();
    return all[scholarshipId] || {};
  }

  function saveStatusesForScholarship(scholarshipId, updates) {
    const all = getDocumentStatuses();
    all[scholarshipId] = {
      ...getStatusesForScholarship(scholarshipId),
      ...updates
    };
    saveDocumentStatuses(all);
  }

  function renderChecklist() {
    const scholarship = getScholarshipById(scholarshipSelect.value);
    if (!scholarship) {
      checklistContainer.innerHTML = '<div class="empty-state">No scholarship selected.</div>';
      return;
    }

    const statuses = getStatusesForScholarship(scholarship.id);
    const docs = scholarship.requiredDocuments || [];

    if (!docs.length) {
      checklistContainer.innerHTML = '<div class="empty-state">No documents are required for this scholarship.</div>';
      return;
    }

    checklistContainer.innerHTML = `
      <div class="panel-header">
        <h3>${scholarship.name}</h3>
      </div>
      <p style="color: var(--muted); margin-bottom: 16px;">
        Manually changing a document status does not verify authenticity. This is a demo checklist only.
      </p>
      ${docs.map(docName => {
        const status = statuses[docName] || 'missing';
        const buttons = [
          { key: 'uploaded', label: 'Uploaded', active: status === 'uploaded' },
          { key: 'missing', label: 'Missing', active: status === 'missing' },
          { key: 'verified', label: 'Verified', active: status === 'verified' }
        ];

        return `
          <div class="document-item">
            <div class="doc-meta">
              <strong>${docName}</strong>
              <div class="meta-row">
                <span class="badge ${status === 'uploaded' ? 'badge-primary' : status === 'verified' ? 'badge-success' : 'badge-warning'}">
                  ${status === 'uploaded' ? 'Uploaded' : status === 'verified' ? 'Verified' : 'Missing'}
                </span>
              </div>
            </div>

            <div class="doc-actions">
              ${buttons.map(button => `
                <button
                  class="${button.active ? 'active' : ''}"
                  data-doc-name="${docName}"
                  data-doc-status="${button.key}"
                >
                  ${button.label}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    `;

    checklistContainer.querySelectorAll('[data-doc-status]').forEach(button => {
      button.addEventListener('click', () => {
        const docName = button.dataset.docName;
        const status = button.dataset.docStatus;

        saveStatusesForScholarship(scholarship.id, {
          [docName]: status
        });

        addActivity(`${scholarship.name}: ${docName} marked as ${status}`);
        renderChecklist();
      });
    });
  }

  populateScholarships();
  scholarshipSelect.addEventListener('change', () => {
    setSelectedScholarshipId(scholarshipSelect.value);
    renderChecklist();
  });

  renderChecklist();
});
