# ScholarMate AI

ScholarMate AI is a static, demo-mode scholarship eligibility and document assistant. It helps students compare their profile against fictional scholarship rules, understand missing information, track required documents, and manage application progress using localStorage.

This prototype is designed to be easy to extend with a secure backend and AI API later, while remaining deployable on GitHub Pages without any server-side runtime.

## Features
- Student profile management with validation
- Demo profile selector for three scenarios:
  - meets all sample requirements
  - fails a mandatory requirement
  - missing required information
- Scholarship explorer with search, filters, sorting, and detail-style display
- Real JavaScript eligibility engine comparing:
  - minimum marks
  - maximum family income
  - eligible course
  - study year
  - state/domicile
  - additional mandatory conditions
- Transparent decision explanations using template-based logic
- Document checklist with statuses:
  - uploaded
  - missing
  - verified
- Scholarship tracker with progress states:
  - Interested
  - Eligibility checked
  - Documents pending
  - Ready to apply
  - Application submitted
  - Result awaited
- Dashboard with computed summary metrics
- Demo data persisted in localStorage
- Prototype banner to clearly label all scholarship data as demonstration only

## File structure
- index.html
- dashboard.html
- profile.html
- scholarships.html
- eligibility.html
- documents.html
- tracker.html
- css/style.css
- js/app.js
- js/profile.js
- js/scholarships.js
- js/eligibility.js
- js/documents.js
- js/tracker.js
- data/scholarships.json
- README.md

## Demo workflow
1. Open the landing page at `index.html`.
2. Fill in or load a demo profile.
3. Browse scholarships and choose one.
4. Run the eligibility checker.
5. Review the rule-by-rule eligibility results.
6. Generate the document checklist.
7. Save the scholarship to the tracker.
8. Update application progress.
9. Refresh the browser and verify the data persists through localStorage.

## Local setup
This project is fully static. You can open the HTML files directly in a browser, or use a local static server such as:
- VS Code Live Server
- Python simple server
- any static hosting service

Example:
```bash
python3 -m http.server 8000
```

Then open:
```text
http://localhost:8000
```

## GitHub Pages deployment
Because the project uses relative paths and static assets, it can be deployed directly on GitHub Pages.

Steps:
1. Push the project to a GitHub repository.
2. Go to the repository Settings.
3. Open Pages.
4. Set the source to the default branch (for example `main`) and root folder.
5. Save.
6. GitHub will publish the site at:
   `https://<username>.github.io/<repository-name>/`

Example:
```text
https://swaraj21-05.github.io/scholarmate-ai/
```

## Important limitations
- This is a prototype using fictional scholarship data.
- No real AI backend is connected.
- No backend/database is used.
- No real student documents are stored.
- The app deliberately uses demo-mode localStorage persistence only.

## Security note
This prototype does not store passwords or sensitive documents. It keeps only non-sensitive demo data in browser localStorage.

## Summary
ScholarMate AI is a front-end prototype that demonstrates how a scholarship eligibility platform could work, while leaving room for a real backend and AI service in the future.
