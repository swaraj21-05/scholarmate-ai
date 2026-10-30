document.addEventListener('DOMContentLoaded', async () => {
  const scholarshipSelect = document.getElementById('selected-scholarship');
  const summarySection = document.getElementById('eligibility-summary');
  const tableBody = document.getElementById('eligibility-table-body');
  const runButton = document.getElementById('run-eligibility');

  if (!scholarshipSelect) return;

  const scholarships = await fetchScholarships();

  function populateScholarships() {
    const selectedId = getSelectedScholarshipId();
    scholarshipSelect.innerHTML = scholarships.map(item => `
      <option value="${item.id}" ${selectedId === item.id ? 'selected' : ''}>${item.name}</option>
    `).join('');

    if (!selectedId && scholarships.length) {
      setSelectedScholarshipId(scholarships[0].id);
    }
  }

  function getStudentValue(profileData, code) {
    const map = {
      academicMarks: Number(profileData.academicMarks || 0),
      annualFamilyIncome: Number(profileData.annualFamilyIncome || 0),
      course: profileData.course || '',
      state: profileData.state || '',
      studyYear: profileData.studyYear || '',
      specialCondition: profileData.specialCondition || ''
    };
    return map[code];
  }

  function compareRule(value, rule) {
    if (rule.type === 'min') return value >= Number(rule.value);
    if (rule.type === 'max') return value <= Number(rule.value);
    if (rule.type === 'contains') {
      if (Array.isArray(rule.value)) {
        return rule.value.includes(value);
      }
      return value === rule.value;
    }
    if (rule.type === 'inArray') {
      return Array.isArray(rule.value) ? rule.value.includes(String(value)) : false;
    }
    return true;
  }

  function getRuleDefinitions(scholarship) {
    return [
      {
        requirement: 'Minimum marks',
        ruleLabel: `${scholarship.minMarks}%`,
        field: 'academicMarks',
        type: 'min',
        value: scholarship.minMarks,
        mandatory: true,
        explanation: 'The scholarship requires a minimum academic mark to check merit eligibility.'
      },
      {
        requirement: 'Maximum family income',
        ruleLabel: `${formatCurrency(scholarship.maxAnnualIncome || 0)}`,
        field: 'annualFamilyIncome',
        type: 'max',
        value: scholarship.maxAnnualIncome || Number.MAX_SAFE_INTEGER,
        mandatory: !!scholarship.maxAnnualIncome,
        explanation: 'The scholarship lists a maximum family income threshold that cannot be exceeded.'
      },
      {
        requirement: 'Eligible course',
        ruleLabel: scholarship.eligibleCourses.join(', '),
        field: 'course',
        type: 'contains',
        value: scholarship.eligibleCourses,
        mandatory: true,
        explanation: 'The scholarship is only available for certain course categories.'
      },
      {
        requirement: 'Study year',
        ruleLabel: scholarship.studyYear || 'Any study year',
        field: 'studyYear',
        type: 'contains',
        value: scholarship.studyYear ? [scholarship.studyYear] : [],
        mandatory: !!scholarship.studyYear,
        explanation: 'Some scholarships restrict eligibility to a specific study year.'
      },
      {
        requirement: 'State / domicile',
        ruleLabel: scholarship.eligibleStates.join(', '),
        field: 'state',
        type: 'contains',
        value: scholarship.eligibleStates,
        mandatory: true,
        explanation: 'The scholarship is only open to students from specific states or domiciles.'
      },
      {
        requirement: 'Other mandatory conditions',
        ruleLabel: scholarship.additionalConditions.join('; '),
        field: 'specialCondition',
        type: 'inArray',
        value: scholarship.additionalConditions,
        mandatory: !!scholarship.additionalConditions.length,
        explanation: 'The scholarship may require a documented special condition or additional eligibility rule.'
      }
    ];
  }

  function evaluateScholarship(profileData, scholarship) {
    const rules = getRuleDefinitions(scholarship);
    let hasMandatoryFailure = false;
    let hasMissingInfo = false;
    const rows = [];

    rules.forEach(rule => {
      const studentValue = getStudentValue(profileData, rule.field);
      const isBlank = studentValue === '' || studentValue === null || studentValue === undefined;

      if (rule.mandatory && isBlank) {
        hasMissingInfo = true;
        rows.push({
          requirement: rule.requirement,
          rule: rule.ruleLabel,
          student: 'Missing',
          result: 'MISSING',
          explanation: `${rule.explanation} This student value is missing, so more information is required.`
        });
        return;
      }

      const passes = compareRule(studentValue, rule);

      if (rule.mandatory && !passes) {
        hasMandatoryFailure = true;
        rows.push({
          requirement: rule.requirement,
          rule: rule.ruleLabel,
          student: studentValue,
          result: 'FAIL',
          explanation: `${rule.explanation} The student value does not satisfy this mandatory condition.`
        });
      } else if (passes) {
        rows.push({
          requirement: rule.requirement,
          rule: rule.ruleLabel,
          student: studentValue,
          result: 'PASS',
          explanation: `${rule.explanation} This requirement is satisfied by the profile.`
        });
      } else {
        rows.push({
          requirement: rule.requirement,
          rule: rule.ruleLabel,
          student: studentValue,
          result: 'FAIL',
          explanation: `${rule.explanation} This requirement does not currently match the profile.`
        });
      }
    });

    let overallResult = 'ELIGIBLE_FOR_LISTED_RULES';
    if (hasMandatoryFailure) {
      overallResult = 'INELIGIBLE';
    } else if (hasMissingInfo) {
      overallResult = 'NEEDS_MORE_INFORMATION';
    }

    return { overallResult, rows };
  }

  function renderSummary(result, scholarship) {
    const resultClasses = {
      ELIGIBLE_FOR_LISTED_RULES: 'badge-success',
      INELIGIBLE: 'badge-danger',
      NEEDS_MORE_INFORMATION: 'badge-warning'
    };

    summarySection.innerHTML = `
      <div class="summary-result">
        <div>
          <h3>${scholarship.name}</h3>
          <p>${scholarship.provider}</p>
        </div>
        <div class="badge ${resultClasses[result] || 'badge-neutral'}">${result}</div>
      </div>
      <p style="margin:12px 0 0; color: var(--muted);">
        ${result === 'ELIGIBLE_FOR_LISTED_RULES' ? 'All mandatory conditions are met for the listed rules.' :
          result === 'INELIGIBLE' ? 'At least one mandatory condition failed.' :
          'No mandatory failure is present, but some needed information is missing.'}
      </p>
    `;
  }

  function renderTable(rows) {
    tableBody.innerHTML = rows.map(row => {
      const resultClass = row.result === 'PASS' ? 'result-pass' :
        row.result === 'FAIL' ? 'result-fail' :
        'result-missing';

      return `
        <tr>
          <td>${row.requirement}</td>
          <td>${row.rule}</td>
          <td>${row.student}</td>
          <td class="${resultClass}">${row.result}</td>
          <td>${row.explanation}</td>
        </tr>
      `;
    }).join('');
  }

  function runCheck() {
    const scholarshipId = scholarshipSelect.value;
    const scholarship = scholarships.find(item => item.id === scholarshipId);
    if (!scholarship) return;

    const result = evaluateScholarship(getProfile(), scholarship);
    renderSummary(result.overallResult, scholarship);
    renderTable(result.rows);

    const history = getEligibilityHistory();
    const nextItem = { scholarshipId: scholarship.id, scholarshipName: scholarship.name, result: result.overallResult, timestamp: new Date().toISOString() };
    history.push(nextItem);
    saveEligibilityHistory(history);
    setSelectedScholarshipId(scholarship.id);
    addActivity(`Eligibility checked for ${scholarship.name}`);

    const saved = getSavedScholarships();
    const index = saved.findIndex(item => item.id === scholarship.id);
    if (index >= 0) {
      saved[index].progress = 'Eligibility checked';
      saveSavedScholarships(saved);
    }
  }

  populateScholarships();
  scholarshipSelect.addEventListener('change', () => setSelectedScholarshipId(scholarshipSelect.value));
  runButton.addEventListener('click', runCheck);

  if (scholarships.length) {
    runCheck();
  }
});
