document.addEventListener('DOMContentLoaded', () => {
  const trackerList = document.getElementById('tracker-list');
  if (!trackerList) return;

  function getProgressOptions() {
    return [
      'Interested',
      'Eligibility checked',
      'Documents pending',
      'Ready to apply',
      'Application submitted',
      'Result awaited'
    ];
  }

  function renderTracker() {
    const saved = getSavedScholarships();

    if (!saved.length) {
      trackerList.innerHTML = '<div class="empty-state">No scholarships are currently being tracked.</div>';
      return;
    }

    trackerList.innerHTML = saved.map(item => {
      const options = getProgressOptions().map(option => `
        <option value="${option}" ${item.progress === option ? 'selected' : ''}>${option}</option>
      `).join('');

      return `
        <div class="tracker-card">
          <div class="tracker-header">
            <div>
              <h3>${item.name}</h3>
              <div class="card-provider">${item.provider}</div>
            </div>
            <span class="badge badge-primary">${item.progress || 'Interested'}</span>
          </div>

          <ul class="detail-list">
            <li><span>Deadline</span><strong>${formatDate(item.deadline)}</strong></li>
            <li><span>Minimum marks</span><strong>${item.minMarks}%</strong></li>
            <li><span>Source</span><strong>${item.sourceUrl || 'Demo only'}</strong></li>
          </ul>

          <div class="form-grid" style="margin-top: 16px;">
            <div class="field">
              <label>Progress</label>
              <select class="progress-select" data-progress-id="${item.id}">
                ${options}
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');

    trackerList.querySelectorAll('[data-progress-id]').forEach(select => {
      select.addEventListener('change', (event) => {
        const id = event.target.dataset.progressId;
        const newProgress = event.target.value;
        updateProgressForScholarship(id, newProgress);
        renderTracker();
      });
    });
  }

  renderTracker();
});
