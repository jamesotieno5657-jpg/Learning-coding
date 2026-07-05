// =============================================
//  PATIENT TRACKER — app.js
//  Phase 1 Capstone Project
// =============================================
//
//  WHAT THIS FILE COVERS (from your course):
//  Week 1  — Variables, arrays, loops, conditions
//  Week 2  — Functions, objects, arrow functions
//  Week 3  — DOM manipulation, events, forms
//  Week 4  — async/await, fetch, localStorage
//
//  Read each section's comment block before the code.
//  Every concept is labelled with the week it came from.
// =============================================


// =============================================
//  STEP 1 — GRAB ELEMENTS FROM THE DOM (Week 3)
//  querySelector finds an HTML element by its
//  id or class name, so JS can read/change it.
// =============================================

const form          = document.getElementById('patient-form');
const nameInput     = document.getElementById('name');
const ageInput      = document.getElementById('age');
const diagnosisInput= document.getElementById('diagnosis');
const statusInput   = document.getElementById('status');
const bpInput       = document.getElementById('bp');
const hrInput       = document.getElementById('hr');
const weightInput   = document.getElementById('weight');
const heightInput   = document.getElementById('height');
const bmiResult     = document.getElementById('bmi-result');
const patientGrid   = document.getElementById('patient-grid');
const emptyState    = document.getElementById('empty-state');
const spinner       = document.getElementById('spinner');
const totalCount    = document.getElementById('total-count');
const criticalCount = document.getElementById('critical-count');
const stableCount   = document.getElementById('stable-count');
const searchInput   = document.getElementById('search-input');
const filterStatus  = document.getElementById('filter-status');
const loadSampleBtn = document.getElementById('load-sample-btn');
const modalOverlay  = document.getElementById('modal-overlay');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');


// =============================================
//  STEP 2 — OUR DATA (Week 1 & 2)
//
//  We store patients in an ARRAY of OBJECTS.
//  Each object is one patient's record.
//
//  We try to load from localStorage first —
//  if there's nothing saved yet, we start empty.
//  localStorage.getItem() returns null if the
//  key doesn't exist, so we fall back to [].
// =============================================

// Week 4: localStorage.getItem reads saved data
// JSON.parse turns the saved text back into a JS array
let patients = JSON.parse(localStorage.getItem('patients')) || [];


// =============================================
//  STEP 3 — SAVE TO LOCALSTORAGE (Week 4)
//
//  Whenever our patients array changes, we call
//  this function to save it. JSON.stringify turns
//  the JS array into text so it can be stored.
// =============================================

const saveToStorage = () => {
  // Week 4: convert array → text, then store it
  localStorage.setItem('patients', JSON.stringify(patients));
};


// =============================================
//  STEP 4 — BMI CALCULATOR (Week 1 & 2)
//
//  We listen for any typing in the weight or
//  height fields and calculate BMI live.
//
//  BMI formula: weight(kg) / height(m)²
// =============================================

// Week 2: arrow function — shorthand for function() {}
const calculateBMI = () => {
  const weight = parseFloat(weightInput.value); // parseFloat: text → decimal number
  const height = parseFloat(heightInput.value);

  // Week 1: if/else — only calculate if we have both values
  if (!weight || !height || height <= 0) {
    bmiResult.textContent = '';
    return; // stop the function here
  }

  const heightInMetres = height / 100; // cm → m
  const bmi = weight / (heightInMetres * heightInMetres);
  const rounded = bmi.toFixed(1); // 1 decimal place

  // Week 1: ternary operator for category
  let category =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Normal weight' :
    bmi < 30   ? 'Overweight' :
                 'Obese';

  bmiResult.textContent = `BMI: ${rounded} — ${category}`;
};

// Week 3: 'input' event fires every time the user types
weightInput.addEventListener('input', calculateBMI);
heightInput.addEventListener('input', calculateBMI);


// =============================================
//  STEP 5 — FORM VALIDATION (Week 3)
//
//  Before saving a patient, we check that all
//  required fields are filled in properly.
//  Returns true if valid, false if not.
// =============================================

const validateForm = () => {
  let isValid = true; // we'll set this to false if anything fails

  // Helper: show or clear an error message
  const setError = (inputEl, errorId, message) => {
    const errorEl = document.getElementById(errorId);
    if (message) {
      inputEl.classList.add('invalid');
      errorEl.textContent = message;
      isValid = false;
    } else {
      inputEl.classList.remove('invalid');
      errorEl.textContent = '';
    }
  };

  // Week 1: conditions to check each field
  setError(nameInput, 'name-error',
    !nameInput.value.trim() ? 'Patient name is required.' : '');

  setError(ageInput, 'age-error',
    !ageInput.value           ? 'Age is required.' :
    ageInput.value < 0        ? 'Age cannot be negative.' :
    ageInput.value > 120      ? 'Please enter a valid age.' : '');

  setError(diagnosisInput, 'diagnosis-error',
    !diagnosisInput.value.trim() ? 'Diagnosis is required.' : '');

  setError(statusInput, 'status-error',
    !statusInput.value ? 'Please select a status.' : '');

  return isValid;
};


// =============================================
//  STEP 6 — CREATE A PATIENT OBJECT (Week 2)
//
//  This function builds one patient object
//  from the form's current values.
//  We use Date.now() to create a unique ID.
// =============================================

const buildPatientObject = () => {
  // Week 2: object literal — key: value pairs
  return {
    id:         Date.now(),         // unique number based on timestamp
    name:       nameInput.value.trim(),
    age:        parseInt(ageInput.value),
    diagnosis:  diagnosisInput.value.trim(),
    status:     statusInput.value,
    bp:         bpInput.value.trim() || 'Not recorded',
    hr:         hrInput.value       || 'Not recorded',
    bmi:        bmiResult.textContent || 'Not calculated',
    admittedAt: new Date().toLocaleString(), // human-readable date/time
  };
};


// =============================================
//  STEP 7 — RENDER ALL PATIENT CARDS (Week 3)
//
//  This function clears the grid and re-draws
//  every patient card from scratch.
//  We call it whenever the patients array changes.
// =============================================

const renderPatients = () => {
  // Read the current search text and filter selection
  const searchTerm   = searchInput.value.toLowerCase();
  const statusFilter = filterStatus.value;

  // Week 2: filter() — returns a new array with only matching items
  const filtered = patients.filter(patient => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.diagnosis.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || patient.status === statusFilter;

    // Week 1: logical AND — both conditions must be true
    return matchesSearch && matchesStatus;
  });

  // Clear the grid before re-drawing
  patientGrid.innerHTML = '';

  // Show empty state if no patients match
  if (filtered.length === 0) {
    emptyState.classList.add('show');
  } else {
    emptyState.classList.remove('show');
  }

  // Week 1: forEach loop — run code for each patient
  filtered.forEach(patient => {
    // Week 3: createElement — makes a new HTML element
    const card = document.createElement('div');
    card.className = `patient-card status-${patient.status}`;

    // Week 1: template literals — embed variables inside strings
    card.innerHTML = `
      <div class="card-name">${patient.name}</div>
      <div class="card-age">Age: ${patient.age}</div>
      <div class="card-diagnosis">${patient.diagnosis}</div>
      <div class="card-footer">
        <span class="card-badge badge-${patient.status}">${patient.status}</span>
        <div class="card-vitals">BP: ${patient.bp} | HR: ${patient.hr}</div>
      </div>
      <div class="card-footer" style="margin-top:8px">
        <span style="font-size:11px;color:#9CA3AF">${patient.admittedAt}</span>
        <button class="btn-delete" data-id="${patient.id}">Remove</button>
      </div>
    `;

    // Week 3: clicking the card (but NOT the delete button) opens the modal
    card.addEventListener('click', (event) => {
      // event.target is the element that was actually clicked
      if (!event.target.classList.contains('btn-delete')) {
        openModal(patient);
      }
    });

    // Week 3: appendChild — add the card into the grid
    patientGrid.appendChild(card);
  });

  updateStats();
};


// =============================================
//  STEP 8 — UPDATE HEADER STATS (Week 1 & 2)
//
//  Counts total, critical, and stable patients
//  and displays them in the header boxes.
// =============================================

const updateStats = () => {
  // Week 2: filter to count patients by status
  const criticals = patients.filter(p => p.status === 'critical').length;
  const stables   = patients.filter(p => p.status === 'stable').length;

  // Week 3: update the DOM text
  totalCount.textContent    = patients.length;
  criticalCount.textContent = criticals;
  stableCount.textContent   = stables;
};


// =============================================
//  STEP 9 — DELETE A PATIENT (Week 2 & 3)
//
//  We use EVENT DELEGATION here — instead of
//  adding a click listener to each delete button,
//  we listen on the whole grid and check what
//  was clicked. This is more efficient.
// =============================================

patientGrid.addEventListener('click', (event) => {
  // Week 3: check if the clicked element is a delete button
  if (event.target.classList.contains('btn-delete')) {
    // data-id is a custom attribute we put on the button
    const idToDelete = parseInt(event.target.getAttribute('data-id'));

    // Week 2: filter() returns everyone EXCEPT the deleted patient
    patients = patients.filter(patient => patient.id !== idToDelete);

    saveToStorage(); // Week 4: update localStorage
    renderPatients(); // re-draw the list
  }
});


// =============================================
//  STEP 10 — SUBMIT FORM (Week 3)
//
//  When the form is submitted, we:
//  1. Prevent the page from reloading (default behaviour)
//  2. Validate the form
//  3. Build the patient object
//  4. Add it to our array
//  5. Save + re-render
// =============================================

form.addEventListener('submit', (event) => {
  // Week 3: preventDefault stops the browser reloading the page
  event.preventDefault();

  if (!validateForm()) return; // stop if validation fails

  const newPatient = buildPatientObject();

  // Week 1: push() adds an item to the end of an array
  patients.push(newPatient);

  saveToStorage();  // Week 4
  renderPatients(); // Week 3
  form.reset();     // clear the form fields
  bmiResult.textContent = '';
});


// =============================================
//  STEP 11 — SEARCH & FILTER (Week 3)
//
//  Any time the user types in the search box
//  or changes the filter dropdown, we re-render
//  the patient list so it updates instantly.
// =============================================

searchInput.addEventListener('input', renderPatients);
filterStatus.addEventListener('change', renderPatients);


// =============================================
//  STEP 12 — PATIENT DETAIL MODAL (Week 3)
//
//  Clicking a card shows a pop-up with the
//  patient's full details.
// =============================================

const openModal = (patient) => {
  // Week 1: template literals to build the modal content
  modalBody.innerHTML = `
    <div class="modal-name">${patient.name}</div>
    <div class="modal-meta">Age ${patient.age} · Admitted: ${patient.admittedAt}</div>
    <span class="card-badge badge-${patient.status}" style="font-size:13px">${patient.status}</span>

    <div class="modal-section">Diagnosis</div>
    <div class="modal-row"><span>${patient.diagnosis}</span></div>

    <div class="modal-section">Vitals</div>
    <div class="modal-row">Blood Pressure <span>${patient.bp}</span></div>
    <div class="modal-row">Heart Rate     <span>${patient.hr} bpm</span></div>
    <div class="modal-row">BMI            <span>${patient.bmi}</span></div>
  `;

  // Week 3: add 'show' class to make the overlay visible (CSS handles the rest)
  modalOverlay.classList.add('show');
};

// Close modal when clicking X or the dark background
modalClose.addEventListener('click', () => modalOverlay.classList.remove('show'));
modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) modalOverlay.classList.remove('show');
});


// =============================================
//  STEP 13 — LOAD SAMPLE DATA (Week 4)
//
//  This is where async/await comes in.
//  We PRETEND to call an API by wrapping
//  sample data in a Promise with a delay.
//  This teaches the same skill as a real fetch().
//
//  In real life you'd replace mockFetch() with:
//  const response = await fetch('https://api.example.com/patients');
// =============================================

// A fake API call that resolves after 1.2 seconds
const mockFetch = () => {
  // Week 4: Promise — represents a value that arrives later
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: Date.now() + 1, name: 'Amina Wanjiku',  age: 34, diagnosis: 'Type 2 Diabetes',    status: 'stable',      bp: '130/85', hr: '78',  bmi: 'BMI: 27.3 — Overweight',    admittedAt: new Date().toLocaleString() },
        { id: Date.now() + 2, name: 'Peter Kamau',    age: 67, diagnosis: 'Heart Failure',       status: 'critical',    bp: '160/100',hr: '102', bmi: 'Not calculated',             admittedAt: new Date().toLocaleString() },
        { id: Date.now() + 3, name: 'Grace Otieno',   age: 28, diagnosis: 'Pneumonia',           status: 'observation', bp: '118/76', hr: '90',  bmi: 'BMI: 22.1 — Normal weight',  admittedAt: new Date().toLocaleString() },
        { id: Date.now() + 4, name: 'James Mwangi',   age: 52, diagnosis: 'Hypertension',        status: 'stable',      bp: '145/92', hr: '82',  bmi: 'BMI: 29.8 — Overweight',    admittedAt: new Date().toLocaleString() },
        { id: Date.now() + 5, name: 'Fatuma Hassan',  age: 71, diagnosis: 'Stroke (Recovery)',   status: 'observation', bp: '140/90', hr: '76',  bmi: 'Not calculated',             admittedAt: new Date().toLocaleString() },
        { id: Date.now() + 6, name: 'Brian Odhiambo', age: 19, diagnosis: 'Malaria',             status: 'stable',      bp: '110/70', hr: '88',  bmi: 'BMI: 20.5 — Normal weight',  admittedAt: new Date().toLocaleString() },
      ]);
    }, 1200); // 1.2 second delay to simulate a real network call
  });
};

// The async function that calls mockFetch and handles the result
const loadSamplePatients = async () => {
  // Show a loading spinner while "fetching"
  spinner.classList.add('show');
  emptyState.classList.remove('show');
  patientGrid.innerHTML = '';
  loadSampleBtn.disabled = true;

  // Week 4: try/catch — handle errors gracefully
  try {
    // Week 4: await — pause here until the Promise resolves
    const sampleData = await mockFetch();

    // Week 2: spread operator — combine existing patients with new ones
    patients = [...patients, ...sampleData];

    saveToStorage();
    renderPatients();

  } catch (error) {
    // If something goes wrong, tell the user
    console.error('Failed to load sample data:', error);
    alert('Could not load sample patients. Please try again.');
  } finally {
    // 'finally' runs whether it succeeded or failed
    spinner.classList.remove('show');
    loadSampleBtn.disabled = false;
  }
};

loadSampleBtn.addEventListener('click', loadSamplePatients);


// =============================================
//  STEP 14 — INITIALISE THE APP
//
//  This runs once when the page loads.
//  It renders whatever is already in localStorage
//  so the page feels persistent between visits.
// =============================================

renderPatients();
