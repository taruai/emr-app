const { ipcRenderer } = require('electron');

// Global variables
let patients = [];
let appointments = [];
let vitalSigns = [];
let labResults = [];
let medicalHistory = [];
let allergies = [];
let medications = [];

// DOM Elements
const patientsTable = document.getElementById('patientsTable').getElementsByTagName('tbody')[0];
const appointmentsTable = document.getElementById('appointmentsTable').getElementsByTagName('tbody')[0];
const vitalsTable = document.getElementById('vitalsTable').getElementsByTagName('tbody')[0];
const labResultsTable = document.getElementById('labResultsTable').getElementsByTagName('tbody')[0];

// Search inputs
const patientSearch = document.getElementById('patientSearch');
const appointmentSearch = document.getElementById('appointmentSearch');
const vitalsSearch = document.getElementById('vitalsSearch');
const labSearch = document.getElementById('labSearch');

// Forms
const addPatientForm = document.getElementById('addPatientForm');
const editPatientForm = document.getElementById('editPatientForm');
const addAppointmentForm = document.getElementById('addAppointmentForm');
const addVitalsForm = document.getElementById('addVitalsForm');
const addLabResultForm = document.getElementById('addLabResultForm');

// Buttons
const savePatientBtn = document.getElementById('savePatientBtn');
const updatePatientBtn = document.getElementById('updatePatientBtn');
const saveAppointmentBtn = document.getElementById('saveAppointmentBtn');
const saveVitalsBtn = document.getElementById('saveVitalsBtn');
const saveLabResultBtn = document.getElementById('saveLabResultBtn');

// Load data on startup
document.addEventListener('DOMContentLoaded', () => {
    loadPatients();
    loadAppointments();
    loadVitalSigns();
    loadLabResults();
    loadMedicalHistoryAndAllergies();
    loadAllergies();
    loadMedications();
    setupEventListeners();
    populatePatientSelects();
    document.getElementById('addMedicationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const medData = {
            patient_id: formData.get('patient_id'),
            drug_name: formData.get('drug_name'),
            dosage: formData.get('dosage'),
            frequency: formData.get('frequency'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date')
        };
        try {
            await ipcRenderer.invoke('add-medication', medData);
            await loadMedications();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addMedicationModal'));
            modal.hide();
            e.target.reset();
        } catch (error) {
            console.error('Error adding medication:', error);
            alert('Failed to add medication');
        }
    });

    // Ensure settings icon triggers section switch
    const settingsLink = document.querySelector('a.nav-link[data-section="settings"]');
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('settings');
        });
    }
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    patientSearch.addEventListener('input', () => filterPatients(patientSearch.value));
    appointmentSearch.addEventListener('input', () => filterAppointments(appointmentSearch.value));
    vitalsSearch.addEventListener('input', () => filterVitalSigns(vitalsSearch.value));
    labSearch.addEventListener('input', () => filterLabResults(labSearch.value));

    // Save patient button
    savePatientBtn.addEventListener('click', async () => {
        const formData = new FormData(addPatientForm);
        const patientData = {
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            sex: formData.get('sex'),
            contact: formData.get('contact'),
            address: formData.get('address'),
            civil_status: formData.get('civil_status'),
            date_of_birth: formData.get('date_of_birth'),
            birthplace: formData.get('birthplace'),
            primary_language: formData.get('primary_language'),
            religion: formData.get('religion'),
            occupation: formData.get('occupation'),
            usual_healthcare_provider: formData.get('usual_healthcare_provider'),
            reason_for_health_contact: formData.get('reason_for_health_contact'),
            attending_physician: formData.get('attending_physician'),
            weight: parseFloat(formData.get('weight')) || null,
            height: parseFloat(formData.get('height')) || null
        };

        try {
            await ipcRenderer.invoke('add-patient', patientData);
            const modal = bootstrap.Modal.getInstance(document.getElementById('addPatientModal'));
            modal.hide();
            addPatientForm.reset();
            loadPatients();
            populatePatientSelects();
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('Error adding patient. Please try again.');
        }
    });

    // Update patient button
    updatePatientBtn.addEventListener('click', async () => {
        const formData = new FormData(editPatientForm);
        const patientData = {
            id: formData.get('id'),
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            sex: formData.get('sex'),
            contact: formData.get('contact'),
            address: formData.get('address'),
            civil_status: formData.get('civil_status'),
            date_of_birth: formData.get('date_of_birth'),
            birthplace: formData.get('birthplace'),
            primary_language: formData.get('primary_language'),
            religion: formData.get('religion'),
            occupation: formData.get('occupation'),
            usual_healthcare_provider: formData.get('usual_healthcare_provider'),
            reason_for_health_contact: formData.get('reason_for_health_contact'),
            attending_physician: formData.get('attending_physician'),
            weight: parseFloat(formData.get('weight')) || null,
            height: parseFloat(formData.get('height')) || null
        };

        try {
            await ipcRenderer.invoke('update-patient', patientData);
            const modal = bootstrap.Modal.getInstance(document.getElementById('editPatientModal'));
            modal.hide();
            editPatientForm.reset();
            loadPatients();
            populatePatientSelects();
        } catch (error) {
            console.error('Error updating patient:', error);
            alert('Error updating patient. Please try again.');
        }
    });

    // Save appointment button
    saveAppointmentBtn.addEventListener('click', async () => {
        const formData = new FormData(addAppointmentForm);
        const appointmentData = {
            patient_id: formData.get('patient_id'),
            appointment_date: formData.get('appointment_date'),
            reason: formData.get('reason'),
            status: formData.get('status'),
            follow_up_instructions: formData.get('follow_up_instructions')
        };

        try {
            await ipcRenderer.invoke('add-appointment', appointmentData);
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAppointmentModal'));
            modal.hide();
            addAppointmentForm.reset();
            loadAppointments();
        } catch (error) {
            console.error('Error adding appointment:', error);
            alert('Error adding appointment. Please try again.');
        }
    });

    // Save vital signs button
    saveVitalsBtn.addEventListener('click', async () => {
        const formData = new FormData(addVitalsForm);
        const vitalSignsData = {
            patient_id: formData.get('patient_id'),
            blood_pressure: formData.get('blood_pressure'),
            pulse: parseInt(formData.get('pulse')),
            temperature: parseFloat(formData.get('temperature')),
            respiratory_rate: parseInt(formData.get('respiratory_rate')),
            oxygen_saturation: parseInt(formData.get('oxygen_saturation'))
        };

        try {
            await ipcRenderer.invoke('add-vital-signs', vitalSignsData);
            const modal = bootstrap.Modal.getInstance(document.getElementById('addVitalsModal'));
            modal.hide();
            addVitalsForm.reset();
            loadVitalSigns();
        } catch (error) {
            console.error('Error adding vital signs:', error);
            alert('Error adding vital signs. Please try again.');
        }
    });

    // Save lab result button
    saveLabResultBtn.addEventListener('click', async () => {
        const formData = new FormData(addLabResultForm);
        const labResultData = {
            patient_id: formData.get('patient_id'),
            test_name: formData.get('test_name'),
            result: formData.get('result'),
            unit: formData.get('unit'),
            reference_range: formData.get('reference_range'),
            is_abnormal: formData.get('is_abnormal') === 'on'
        };

        try {
            await ipcRenderer.invoke('add-lab-result', labResultData);
            const modal = bootstrap.Modal.getInstance(document.getElementById('addLabResultModal'));
            modal.hide();
            addLabResultForm.reset();
            loadLabResults();
        } catch (error) {
            console.error('Error adding lab result:', error);
            alert('Error adding lab result. Please try again.');
        }
    });

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            showSection(section);
        });
    });
}

// Filter functions
function filterPatients(searchTerm) {
    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayPatients(filteredPatients);
}

function filterAppointments(searchTerm) {
    const filteredAppointments = appointments.filter(appointment => 
        appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayAppointments(filteredAppointments);
}

function filterVitalSigns(searchTerm) {
    const filteredVitals = vitalSigns.filter(vital => 
        vital.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayVitalSigns(filteredVitals);
}

function filterLabResults(searchTerm) {
    const filteredLabs = labResults.filter(lab => 
        lab.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.test_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayLabResults(filteredLabs);
}

// Load data functions
async function loadPatients() {
    try {
        patients = await ipcRenderer.invoke('get-patients');
        displayPatients(patients);
    } catch (error) {
        console.error('Error loading patients:', error);
        alert('Error loading patients. Please refresh the page.');
    }
}

async function loadAppointments() {
    try {
        appointments = await ipcRenderer.invoke('get-appointments');
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        alert('Error loading appointments. Please refresh the page.');
    }
}

async function loadVitalSigns() {
    try {
        vitalSigns = await ipcRenderer.invoke('get-vital-signs');
        displayVitalSigns(vitalSigns);
    } catch (error) {
        console.error('Error loading vital signs:', error);
        alert('Error loading vital signs. Please refresh the page.');
    }
}

async function loadLabResults() {
    try {
        labResults = await ipcRenderer.invoke('get-lab-results');
        displayLabResults(labResults);
    } catch (error) {
        console.error('Error loading lab results:', error);
        alert('Error loading lab results. Please refresh the page.');
    }
}

// Display functions
function displayPatients(patients) {
    patientsTable.innerHTML = '';
    patients.forEach(patient => {
        const row = patientsTable.insertRow();
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.sex}</td>
            <td>${patient.contact}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewPatient(${patient.id})">View</button>
                <button class="btn btn-sm btn-warning" onclick="editPatient(${patient.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
            </td>
        `;
    });
}

function displayAppointments(appointments) {
    appointmentsTable.innerHTML = '';
    appointments.forEach(appointment => {
        const row = appointmentsTable.insertRow();
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>${appointment.patient_name}</td>
            <td>${new Date(appointment.appointment_date).toLocaleString()}</td>
            <td>${appointment.reason}</td>
            <td><span class="badge bg-${getStatusBadgeColor(appointment.status)}">${appointment.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewAppointment(${appointment.id})">View</button>
                <button class="btn btn-sm btn-warning" onclick="editAppointment(${appointment.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${appointment.id})">Delete</button>
            </td>
        `;
    });
}

function displayVitalSigns(vitalSigns) {
    vitalsTable.innerHTML = '';
    vitalSigns.forEach(vital => {
        const row = vitalsTable.insertRow();
        row.innerHTML = `
            <td>${vital.patient_name}</td>
            <td>${new Date(vital.recorded_at).toLocaleString()}</td>
            <td>${vital.blood_pressure}</td>
            <td>${vital.pulse}</td>
            <td>${vital.temperature}°C</td>
            <td>${vital.respiratory_rate}</td>
            <td>${vital.oxygen_saturation}%</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewVitalSigns(${vital.id})">View</button>
                <button class="btn btn-sm btn-warning" onclick="editVitalSigns(${vital.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteVitalSigns(${vital.id})">Delete</button>
            </td>
        `;
    });
}

function displayLabResults(labResults) {
    labResultsTable.innerHTML = '';
    labResults.forEach(result => {
        const row = labResultsTable.insertRow();
        row.innerHTML = `
            <td>${result.patient_name}</td>
            <td>${result.test_name}</td>
            <td>${result.result}</td>
            <td>${result.unit}</td>
            <td>${result.reference_range}</td>
            <td><span class="badge bg-${result.is_abnormal ? 'danger' : 'success'}">${result.is_abnormal ? 'Abnormal' : 'Normal'}</span></td>
            <td>${new Date(result.recorded_at).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewLabResult(${result.id})">View</button>
                <button class="btn btn-sm btn-warning" onclick="editLabResult(${result.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteLabResult(${result.id})">Delete</button>
            </td>
        `;
    });
}

// Helper functions
function getStatusBadgeColor(status) {
    switch (status.toLowerCase()) {
        case 'scheduled':
            return 'primary';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

async function populatePatientSelects() {
    try {
        const patients = await ipcRenderer.invoke('get-patients');
        const patientSelects = document.querySelectorAll('select[name="patient_id"]');
        patientSelects.forEach(select => {
            select.innerHTML = '<option value="">Select Patient...</option>';
            patients.forEach(patient => {
                select.innerHTML += `<option value="${patient.id}">${patient.name}</option>`;
            });
        });
    } catch (error) {
        console.error('Error populating patient selects:', error);
    }
}

// Show selected section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(`${sectionId}-section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
}

// Action functions
async function viewPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient) {
        document.getElementById('viewPatientName').textContent = patient.name;
        document.getElementById('viewPatientAge').textContent = patient.age;
        document.getElementById('viewPatientSex').textContent = patient.sex;
        document.getElementById('viewPatientContact').textContent = patient.contact;
        document.getElementById('viewPatientAddress').textContent = patient.address;
        document.getElementById('viewPatientCivilStatus').textContent = patient.civil_status;
        document.getElementById('viewPatientDOB').textContent = new Date(patient.date_of_birth).toLocaleDateString();
        document.getElementById('viewPatientBirthplace').textContent = patient.birthplace;
        document.getElementById('viewPatientLanguage').textContent = patient.primary_language;
        document.getElementById('viewPatientReligion').textContent = patient.religion;
        document.getElementById('viewPatientOccupation').textContent = patient.occupation;
        document.getElementById('viewPatientHealthcareProvider').textContent = patient.usual_healthcare_provider;
        document.getElementById('viewPatientHealthContact').textContent = patient.reason_for_health_contact;
        document.getElementById('viewPatientPhysician').textContent = patient.attending_physician;
        document.getElementById('viewPatientWeight').textContent = patient.weight ? `${patient.weight} kg` : 'N/A';
        document.getElementById('viewPatientHeight').textContent = patient.height ? `${patient.height} cm` : 'N/A';

        // Load and display related data
        const vitals = await ipcRenderer.invoke('get-patient-vitals', id);
        const allergies = await ipcRenderer.invoke('get-patient-allergies', id);
        const medications = await ipcRenderer.invoke('get-patient-medications', id);
        const labs = await ipcRenderer.invoke('get-patient-labs', id);
        const history = await ipcRenderer.invoke('get-patient-history', id);

        // Display the data
        displayPatientVitals(vitals);
        displayPatientAllergies(allergies);
        displayPatientMedications(medications);
        displayPatientLabs(labs);
        displayPatientHistory(history);

        // Show modal using Bootstrap's modal method
        const viewModal = new bootstrap.Modal(document.getElementById('viewPatientModal'));
        viewModal.show();
    }
}

async function editPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient) {
        // Create and show modal
        const modalHtml = `
            <div class="modal fade" id="editPatientModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Patient</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editPatientForm">
                                <input type="hidden" name="id" value="${patient.id}">
                                <div class="mb-3">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-control" name="name" value="${patient.name}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Age</label>
                                    <input type="number" class="form-control" name="age" value="${patient.age}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Sex</label>
                                    <select class="form-select" name="sex" required>
                                        <option value="">Select...</option>
                                        <option value="M" ${patient.sex === 'M' ? 'selected' : ''}>Male</option>
                                        <option value="F" ${patient.sex === 'F' ? 'selected' : ''}>Female</option>
                                        <option value="O" ${patient.sex === 'O' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Contact</label>
                                    <input type="tel" class="form-control" name="contact" value="${patient.contact}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Address</label>
                                    <textarea class="form-control" name="address" rows="3" required>${patient.address}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Civil Status</label>
                                    <select class="form-select" name="civil_status" required>
                                        <option value="">Select...</option>
                                        <option value="Single" ${patient.civil_status === 'Single' ? 'selected' : ''}>Single</option>
                                        <option value="Married" ${patient.civil_status === 'Married' ? 'selected' : ''}>Married</option>
                                        <option value="Widowed" ${patient.civil_status === 'Widowed' ? 'selected' : ''}>Widowed</option>
                                        <option value="Separated" ${patient.civil_status === 'Separated' ? 'selected' : ''}>Separated</option>
                                        <option value="Divorced" ${patient.civil_status === 'Divorced' ? 'selected' : ''}>Divorced</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Date of Birth</label>
                                    <input type="date" class="form-control" name="date_of_birth" value="${patient.date_of_birth}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Birthplace</label>
                                    <input type="text" class="form-control" name="birthplace" value="${patient.birthplace}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Primary Language</label>
                                    <input type="text" class="form-control" name="primary_language" value="${patient.primary_language}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Religion</label>
                                    <input type="text" class="form-control" name="religion" value="${patient.religion}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Occupation</label>
                                    <input type="text" class="form-control" name="occupation" value="${patient.occupation}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Usual Healthcare Provider</label>
                                    <input type="text" class="form-control" name="usual_healthcare_provider" value="${patient.usual_healthcare_provider}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Reason for Health Contact</label>
                                    <textarea class="form-control" name="reason_for_health_contact" rows="3" required>${patient.reason_for_health_contact}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Attending Physician</label>
                                    <input type="text" class="form-control" name="attending_physician" value="${patient.attending_physician}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Weight (kg)</label>
                                    <input type="number" class="form-control" name="weight" value="${patient.weight || ''}" step="0.1">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Height (cm)</label>
                                    <input type="number" class="form-control" name="height" value="${patient.height || ''}" step="0.1">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="updatePatientBtn">Update Patient</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editPatientModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add event listener for update button
        document.getElementById('updatePatientBtn').addEventListener('click', async () => {
            const form = document.getElementById('editPatientForm');
            const formData = new FormData(form);
            const patientData = {
                id: formData.get('id'),
                name: formData.get('name'),
                age: parseInt(formData.get('age')),
                sex: formData.get('sex'),
                contact: formData.get('contact'),
                address: formData.get('address'),
                civil_status: formData.get('civil_status'),
                date_of_birth: formData.get('date_of_birth'),
                birthplace: formData.get('birthplace'),
                primary_language: formData.get('primary_language'),
                religion: formData.get('religion'),
                occupation: formData.get('occupation'),
                usual_healthcare_provider: formData.get('usual_healthcare_provider'),
                reason_for_health_contact: formData.get('reason_for_health_contact'),
                attending_physician: formData.get('attending_physician'),
                weight: parseFloat(formData.get('weight')) || null,
                height: parseFloat(formData.get('height')) || null
            };
            
            try {
                await ipcRenderer.invoke('update-patient', patientData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editPatientModal'));
                modal.hide();
                loadPatients();
                populatePatientSelects();
            } catch (error) {
                console.error('Error updating patient:', error);
                alert('Error updating patient. Please try again.');
            }
        });
        
        // Show modal
        const editModal = new bootstrap.Modal(document.getElementById('editPatientModal'));
        editModal.show();
    }
}

async function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
        try {
            await ipcRenderer.invoke('delete-patient', id);
            loadPatients();
            populatePatientSelects();
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('Error deleting patient. Please try again.');
        }
    }
}

// Action functions for appointments
async function viewAppointment(id) {
    try {
        const appointment = await ipcRenderer.invoke('get-appointment', id);
        
        // Create and show modal
        const modalHtml = `
            <div class="modal fade" id="viewAppointmentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Appointment Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <table class="table">
                                <tr><th>Patient:</th><td>${appointment.patient_name}</td></tr>
                                <tr><th>Date & Time:</th><td>${new Date(appointment.appointment_date).toLocaleString()}</td></tr>
                                <tr><th>Reason:</th><td>${appointment.reason}</td></tr>
                                <tr><th>Status:</th><td><span class="badge bg-${getStatusBadgeColor(appointment.status)}">${appointment.status}</span></td></tr>
                                <tr><th>Follow-up Instructions:</th><td>${appointment.follow_up_instructions || 'None'}</td></tr>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('viewAppointmentModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const viewModal = new bootstrap.Modal(document.getElementById('viewAppointmentModal'));
        viewModal.show();
    } catch (error) {
        console.error('Error viewing appointment:', error);
        alert('Error loading appointment details. Please try again.');
    }
}

async function editAppointment(id) {
    try {
        const appointment = await ipcRenderer.invoke('get-appointment', id);
        
        // Create and show modal
        const modalHtml = `
            <div class="modal fade" id="editAppointmentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Appointment</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editAppointmentForm">
                                <input type="hidden" name="id" value="${appointment.id}">
                                <div class="mb-3">
                                    <label class="form-label">Patient</label>
                                    <select class="form-select" name="patient_id" required>
                                        <option value="">Select Patient...</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Date & Time</label>
                                    <input type="datetime-local" class="form-control" name="appointment_date" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Reason</label>
                                    <textarea class="form-control" name="reason" rows="3" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Status</label>
                                    <select class="form-select" name="status" required>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Follow-up Instructions</label>
                                    <textarea class="form-control" name="follow_up_instructions" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="updateAppointmentBtn">Update Appointment</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editAppointmentModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Populate form
        const form = document.getElementById('editAppointmentForm');
        form.elements['patient_id'].value = appointment.patient_id;
        form.elements['appointment_date'].value = appointment.appointment_date.slice(0, 16);
        form.elements['reason'].value = appointment.reason;
        form.elements['status'].value = appointment.status;
        form.elements['follow_up_instructions'].value = appointment.follow_up_instructions || '';
        
        // Populate patient select
        await populatePatientSelects();
        
        // Add event listener for update button
        document.getElementById('updateAppointmentBtn').addEventListener('click', async () => {
            const formData = new FormData(form);
            const appointmentData = {
                id: formData.get('id'),
                patient_id: formData.get('patient_id'),
                appointment_date: formData.get('appointment_date'),
                reason: formData.get('reason'),
                status: formData.get('status'),
                follow_up_instructions: formData.get('follow_up_instructions')
            };
            
            try {
                await ipcRenderer.invoke('update-appointment', appointmentData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editAppointmentModal'));
                modal.hide();
                loadAppointments();
            } catch (error) {
                console.error('Error updating appointment:', error);
                alert('Error updating appointment. Please try again.');
            }
        });
        
        // Show modal
        const editModal = new bootstrap.Modal(document.getElementById('editAppointmentModal'));
        editModal.show();
    } catch (error) {
        console.error('Error editing appointment:', error);
        alert('Error loading appointment details. Please try again.');
    }
}

async function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        try {
            await ipcRenderer.invoke('delete-appointment', id);
            loadAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Error deleting appointment. Please try again.');
        }
    }
}

// Action functions for vital signs
async function viewVitalSigns(id) {
    try {
        const vitalSigns = await ipcRenderer.invoke('get-vital-signs-by-id', id);
        
        // Create and show modal
        const modalHtml = `
            <div class="modal fade" id="viewVitalSignsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Vital Signs Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <table class="table">
                                <tr><th>Patient:</th><td>${vitalSigns.patient_name}</td></tr>
                                <tr><th>Date & Time:</th><td>${new Date(vitalSigns.recorded_at).toLocaleString()}</td></tr>
                                <tr><th>Blood Pressure:</th><td>${vitalSigns.blood_pressure}</td></tr>
                                <tr><th>Pulse:</th><td>${vitalSigns.pulse} bpm</td></tr>
                                <tr><th>Temperature:</th><td>${vitalSigns.temperature}°C</td></tr>
                                <tr><th>Respiratory Rate:</th><td>${vitalSigns.respiratory_rate}/min</td></tr>
                                <tr><th>Oxygen Saturation:</th><td>${vitalSigns.oxygen_saturation}%</td></tr>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('viewVitalSignsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const viewModal = new bootstrap.Modal(document.getElementById('viewVitalSignsModal'));
        viewModal.show();
    } catch (error) {
        console.error('Error viewing vital signs:', error);
        alert('Error loading vital signs details. Please try again.');
    }
}

async function editVitalSigns(id) {
    try {
        const vitalSigns = await ipcRenderer.invoke('get-vital-signs-by-id', id);
        
        // Create and show modal
        const modalHtml = `
            <div class="modal fade" id="editVitalSignsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Vital Signs</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editVitalSignsForm">
                                <input type="hidden" name="id" value="${vitalSigns.id}">
                                <div class="mb-3">
                                    <label class="form-label">Patient</label>
                                    <select class="form-select" name="patient_id" required>
                                        <option value="">Select Patient...</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Blood Pressure</label>
                                    <input type="text" class="form-control" name="blood_pressure" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Pulse (bpm)</label>
                                    <input type="number" class="form-control" name="pulse" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Temperature (°C)</label>
                                    <input type="number" class="form-control" name="temperature" step="0.1" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Respiratory Rate (breaths/min)</label>
                                    <input type="number" class="form-control" name="respiratory_rate" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Oxygen Saturation (%)</label>
                                    <input type="number" class="form-control" name="oxygen_saturation" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="updateVitalSignsBtn">Update Vital Signs</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editVitalSignsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Populate form
        const form = document.getElementById('editVitalSignsForm');
        form.elements['id'].value = vitalSigns.id;
        form.elements['patient_id'].value = vitalSigns.patient_id;
        form.elements['blood_pressure'].value = vitalSigns.blood_pressure;
        form.elements['pulse'].value = vitalSigns.pulse;
        form.elements['temperature'].value = vitalSigns.temperature;
        form.elements['respiratory_rate'].value = vitalSigns.respiratory_rate;
        form.elements['oxygen_saturation'].value = vitalSigns.oxygen_saturation;
        
        // Populate patient select
        await populatePatientSelects();
        
        // Add event listener for update button
        document.getElementById('updateVitalSignsBtn').addEventListener('click', async () => {
            const formData = new FormData(form);
            const vitalSignsData = {
                id: formData.get('id'),
                patient_id: formData.get('patient_id'),
                blood_pressure: formData.get('blood_pressure'),
                pulse: parseInt(formData.get('pulse')),
                temperature: parseFloat(formData.get('temperature')),
                respiratory_rate: parseInt(formData.get('respiratory_rate')),
                oxygen_saturation: parseInt(formData.get('oxygen_saturation'))
            };
            
            try {
                await ipcRenderer.invoke('update-vital-signs', vitalSignsData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editVitalSignsModal'));
                modal.hide();
                loadVitalSigns();
            } catch (error) {
                console.error('Error updating vital signs:', error);
                alert('Error updating vital signs. Please try again.');
            }
        });
        
        // Show modal
        const editModal = new bootstrap.Modal(document.getElementById('editVitalSignsModal'));
        editModal.show();
    } catch (error) {
        console.error('Error editing vital signs:', error);
        alert('Error loading vital signs details. Please try again.');
    }
}

async function deleteVitalSigns(id) {
    if (confirm('Are you sure you want to delete these vital signs? This action cannot be undone.')) {
        try {
            await ipcRenderer.invoke('delete-vital-signs', id);
            loadVitalSigns();
        } catch (error) {
            console.error('Error deleting vital signs:', error);
            alert('Error deleting vital signs. Please try again.');
        }
    }
}

// Action functions for lab results
async function viewLabResult(id) {
    try {
        const labResult = await ipcRenderer.invoke('get-lab-result', id);
        
        // Create and show modal
        const modalHtml = `
            <div class="modal fade" id="viewLabResultModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Lab Result Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <table class="table">
                                <tr><th>Patient:</th><td>${labResult.patient_name}</td></tr>
                                <tr><th>Date & Time:</th><td>${new Date(labResult.recorded_at).toLocaleString()}</td></tr>
                                <tr><th>Test Name:</th><td>${labResult.test_name}</td></tr>
                                <tr><th>Result:</th><td>${labResult.result} ${labResult.unit}</td></tr>
                                <tr><th>Reference Range:</th><td>${labResult.reference_range}</td></tr>
                                <tr><th>Status:</th><td><span class="badge bg-${labResult.is_abnormal ? 'danger' : 'success'}">${labResult.is_abnormal ? 'Abnormal' : 'Normal'}</span></td></tr>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('viewLabResultModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const viewModal = new bootstrap.Modal(document.getElementById('viewLabResultModal'));
        viewModal.show();
    } catch (error) {
        console.error('Error viewing lab result:', error);
        alert('Error loading lab result details. Please try again.');
    }
}

async function editLabResult(id) {
    try {
        const labResult = await ipcRenderer.invoke('get-lab-result', id);
        
        // Create and show modal
        const modalHtml = `
            <div class="modal fade" id="editLabResultModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Lab Result</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editLabResultForm">
                                <input type="hidden" name="id" value="${labResult.id}">
                                <div class="mb-3">
                                    <label class="form-label">Patient</label>
                                    <select class="form-select" name="patient_id" required>
                                        <option value="">Select Patient...</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Test Name</label>
                                    <input type="text" class="form-control" name="test_name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Result</label>
                                    <input type="text" class="form-control" name="result" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Unit</label>
                                    <input type="text" class="form-control" name="unit" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Reference Range</label>
                                    <input type="text" class="form-control" name="reference_range" required>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="is_abnormal" id="isAbnormal">
                                        <label class="form-check-label" for="isAbnormal">
                                            Mark as Abnormal
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="updateLabResultBtn">Update Lab Result</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editLabResultModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Populate form
        const form = document.getElementById('editLabResultForm');
        form.elements['patient_id'].value = labResult.patient_id;
        form.elements['test_name'].value = labResult.test_name;
        form.elements['result'].value = labResult.result;
        form.elements['unit'].value = labResult.unit;
        form.elements['reference_range'].value = labResult.reference_range;
        form.elements['is_abnormal'].checked = labResult.is_abnormal === 1;
        
        // Populate patient select
        await populatePatientSelects();
        
        // Add event listener for update button
        document.getElementById('updateLabResultBtn').addEventListener('click', async () => {
            const formData = new FormData(form);
            const labResultData = {
                id: formData.get('id'),
                patient_id: formData.get('patient_id'),
                test_name: formData.get('test_name'),
                result: formData.get('result'),
                unit: formData.get('unit'),
                reference_range: formData.get('reference_range'),
                is_abnormal: formData.get('is_abnormal') === 'on'
            };
            
            try {
                await ipcRenderer.invoke('update-lab-result', labResultData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editLabResultModal'));
                modal.hide();
                loadLabResults();
            } catch (error) {
                console.error('Error updating lab result:', error);
                alert('Error updating lab result. Please try again.');
            }
        });
        
        // Show modal
        const editModal = new bootstrap.Modal(document.getElementById('editLabResultModal'));
        editModal.show();
    } catch (error) {
        console.error('Error editing lab result:', error);
        alert('Error loading lab result details. Please try again.');
    }
}

async function deleteLabResult(id) {
    if (confirm('Are you sure you want to delete this lab result? This action cannot be undone.')) {
        try {
            await ipcRenderer.invoke('delete-lab-result', id);
            loadLabResults();
        } catch (error) {
            console.error('Error deleting lab result:', error);
            alert('Error deleting lab result. Please try again.');
        }
    }
}

// Load medical history and allergies on startup
async function loadMedicalHistoryAndAllergies() {
    try {
        medicalHistory = await ipcRenderer.invoke('get-medical-history');
        allergies = await ipcRenderer.invoke('get-allergies');
        displayMedicalHistory();
        displayAllergies();
    } catch (error) {
        console.error('Error loading medical history and allergies:', error);
    }
}

// Display medical history in the table
function displayMedicalHistory() {
    const tbody = document.querySelector('#medicalHistoryTable tbody');
    tbody.innerHTML = '';
    
    medicalHistory.forEach(history => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${history.patient_name}</td>
            <td>${history.diagnosis}</td>
            <td>${history.chronic_condition || 'N/A'}</td>
            <td>${history.procedure || 'N/A'}</td>
            <td>${new Date(history.date_recorded).toLocaleString()}</td>
            <td>
                <button onclick="editMedicalHistory(${history.id})" class="btn btn-sm btn-warning">Edit</button>
                <button onclick="deleteMedicalHistory(${history.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Display allergies in the table
function displayAllergies() {
    const tbody = document.querySelector('#allergiesTable tbody');
    tbody.innerHTML = '';
    
    allergies.forEach(allergy => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${allergy.patient_name}</td>
            <td>${allergy.allergy_type}</td>
            <td>${allergy.description}</td>
            <td>${allergy.severity}</td>
            <td>
                <button onclick="deleteAllergy(${allergy.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add medical history
document.getElementById('addMedicalHistoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const historyData = {
        patient_id: formData.get('patient_id'),
        diagnosis: formData.get('diagnosis'),
        chronic_condition: formData.get('chronic_condition'),
        procedure: formData.get('procedure'),
        date_recorded: formData.get('date_recorded')
    };

    try {
        await ipcRenderer.invoke('add-medical-history', historyData);
        await loadMedicalHistoryAndAllergies();
        const addMedicalHistoryModal = bootstrap.Modal.getInstance(document.getElementById('addMedicalHistoryModal'));
        addMedicalHistoryModal.hide();
        e.target.reset();
    } catch (error) {
        console.error('Error adding medical history:', error);
        alert('Failed to add medical history');
    }
});

// Add allergy
document.getElementById('addAllergyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const allergyData = {
        patient_id: formData.get('patient_id'),
        allergy_type: formData.get('allergy_type'),
        description: formData.get('description'),
        severity: formData.get('severity')
    };

    try {
        await ipcRenderer.invoke('add-allergy', allergyData);
        await loadAllergies();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAllergyModal'));
        modal.hide();
        e.target.reset();
    } catch (error) {
        console.error('Error adding allergy:', error);
        alert('Failed to add allergy');
    }
});

// View medical history
async function viewMedicalHistory(id) {
    const history = medicalHistory.find(h => h.id === id);
    if (history) {
        document.getElementById('viewMedicalHistoryPatient').textContent = history.patient_name;
        document.getElementById('viewMedicalHistoryDiagnosis').textContent = history.diagnosis;
        document.getElementById('viewMedicalHistoryChronic').textContent = history.chronic_condition || 'N/A';
        document.getElementById('viewMedicalHistoryProcedure').textContent = history.procedure || 'N/A';
        document.getElementById('viewMedicalHistoryDate').textContent = new Date(history.date_recorded).toLocaleDateString();
        $('#viewMedicalHistoryModal').modal('show');
    }
}

// View allergy
async function viewAllergy(id) {
    const allergy = allergies.find(a => a.id === id);
    if (allergy) {
        document.getElementById('viewAllergyPatient').textContent = allergy.patient_name;
        document.getElementById('viewAllergyType').textContent = allergy.allergy_type;
        document.getElementById('viewAllergyDescription').textContent = allergy.description;
        document.getElementById('viewAllergySeverity').textContent = allergy.severity;
        $('#viewAllergyModal').modal('show');
    }
}

// Edit medical history
async function editMedicalHistory(id) {
    try {
        const history = medicalHistory.find(h => h.id === id);
        if (history) {
            const form = document.getElementById('editMedicalHistoryForm');
            form.elements['id'].value = history.id;
            form.elements['patient_id'].value = history.patient_id;
            form.elements['diagnosis'].value = history.diagnosis;
            form.elements['chronic_condition'].value = history.chronic_condition || '';
            form.elements['procedure'].value = history.procedure || '';
            form.elements['date_recorded'].value = history.date_recorded.slice(0, 16); // Format datetime-local input

            // Populate patient select
            await populatePatientSelects();

            // Add form submit handler
            form.onsubmit = async (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(form);
                    const historyData = {
                        id: formData.get('id'),
                        patient_id: formData.get('patient_id'),
                        diagnosis: formData.get('diagnosis'),
                        chronic_condition: formData.get('chronic_condition'),
                        procedure: formData.get('procedure'),
                        date_recorded: formData.get('date_recorded')
                    };

                    console.log('Updating medical history with data:', historyData); // Debug log

                    const result = await ipcRenderer.invoke('update-medical-history', historyData);
                    console.log('Update result:', result); // Debug log

                    if (result) {
                        await loadMedicalHistoryAndAllergies();
                        const modal = bootstrap.Modal.getInstance(document.getElementById('editMedicalHistoryModal'));
                        modal.hide();
                    } else {
                        throw new Error('Update failed');
                    }
                } catch (error) {
                    console.error('Error updating medical history:', error);
                    alert('Failed to update medical history. Please try again.');
                }
            };

            // Show modal
            const editModal = new bootstrap.Modal(document.getElementById('editMedicalHistoryModal'));
            editModal.show();
        }
    } catch (error) {
        console.error('Error editing medical history:', error);
        alert('Error loading medical history details. Please try again.');
    }
}

// Edit allergy
async function editAllergy(id) {
    const allergy = allergies.find(a => a.id === id);
    if (allergy) {
        document.getElementById('editAllergyId').value = allergy.id;
        document.getElementById('editAllergyPatient').value = allergy.patient_id;
        document.getElementById('editAllergyType').value = allergy.allergy_type;
        document.getElementById('editAllergyDescription').value = allergy.description;
        document.getElementById('editAllergySeverity').value = allergy.severity;
        $('#editAllergyModal').modal('show');
    }
}

// Update allergy
document.getElementById('editAllergyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const allergyData = {
        id: formData.get('id'),
        patient_id: formData.get('patient_id'),
        allergy_type: formData.get('allergy_type'),
        description: formData.get('description'),
        severity: formData.get('severity')
    };

    try {
        await ipcRenderer.invoke('update-allergy', allergyData);
        await loadAllergies();
        $('#editAllergyModal').modal('hide');
    } catch (error) {
        console.error('Error updating allergy:', error);
        alert('Failed to update allergy');
    }
});

// Delete medical history
async function deleteMedicalHistory(id) {
    if (confirm('Are you sure you want to delete this medical history record?')) {
        try {
            await ipcRenderer.invoke('delete-medical-history', id);
            await loadMedicalHistoryAndAllergies();
        } catch (error) {
            console.error('Error deleting medical history:', error);
            alert('Failed to delete medical history');
        }
    }
}

// Delete allergy
async function deleteAllergy(id) {
    if (confirm('Are you sure you want to delete this allergy record?')) {
        try {
            await ipcRenderer.invoke('delete-allergy', id);
            await loadAllergies();
        } catch (error) {
            console.error('Error deleting allergy:', error);
            alert('Failed to delete allergy');
        }
    }
}

// Search medical history
document.getElementById('searchMedicalHistory').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredHistory = medicalHistory.filter(history => 
        history.patient_name.toLowerCase().includes(searchTerm) ||
        history.diagnosis.toLowerCase().includes(searchTerm) ||
        (history.chronic_condition && history.chronic_condition.toLowerCase().includes(searchTerm)) ||
        (history.procedure && history.procedure.toLowerCase().includes(searchTerm))
    );
    displayFilteredMedicalHistory(filteredHistory);
});

// Search allergies
document.getElementById('searchAllergies').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredAllergies = allergies.filter(allergy =>
        allergy.patient_name.toLowerCase().includes(searchTerm) ||
        allergy.allergy_type.toLowerCase().includes(searchTerm) ||
        allergy.description.toLowerCase().includes(searchTerm) ||
        allergy.severity.toLowerCase().includes(searchTerm)
    );
    displayFilteredAllergies(filteredAllergies);
});

// Display filtered medical history
function displayFilteredMedicalHistory(filteredHistory) {
    const tbody = document.querySelector('#medicalHistoryTable tbody');
    tbody.innerHTML = '';
    
    filteredHistory.forEach(history => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${history.patient_name}</td>
            <td>${history.diagnosis}</td>
            <td>${history.chronic_condition || 'N/A'}</td>
            <td>${history.procedure || 'N/A'}</td>
            <td>${new Date(history.date_recorded).toLocaleDateString()}</td>
            <td>
                <button onclick="editMedicalHistory(${history.id})" class="btn btn-sm btn-warning">Edit</button>
                <button onclick="deleteMedicalHistory(${history.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Display filtered allergies
function displayFilteredAllergies(filteredAllergies) {
    const tbody = document.querySelector('#allergiesTable tbody');
    tbody.innerHTML = '';
    
    filteredAllergies.forEach(allergy => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${allergy.patient_name}</td>
            <td>${allergy.allergy_type}</td>
            <td>${allergy.description}</td>
            <td>${allergy.severity}</td>
            <td>
                <button onclick="deleteAllergy(${allergy.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// --- Allergies ---
async function loadAllergies() {
    try {
        allergies = await ipcRenderer.invoke('get-allergies');
        displayAllergies();
    } catch (error) {
        console.error('Error loading allergies:', error);
    }
}

function displayAllergies() {
    const tbody = document.querySelector('#allergiesTable tbody');
    tbody.innerHTML = '';
    allergies.forEach(allergy => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${allergy.patient_name}</td>
            <td>${allergy.allergy_type}</td>
            <td>${allergy.description}</td>
            <td>${allergy.severity}</td>
            <td>
                <button onclick="deleteAllergy(${allergy.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// --- Medications ---
async function loadMedications() {
    try {
        medications = await ipcRenderer.invoke('get-medications');
        displayMedications();
    } catch (error) {
        console.error('Error loading medications:', error);
    }
}

function displayMedications() {
    const tbody = document.querySelector('#medicationsTable tbody');
    tbody.innerHTML = '';
    medications.forEach(med => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${med.patient_name}</td>
            <td>${med.drug_name}</td>
            <td>${med.dosage}</td>
            <td>${med.frequency}</td>
            <td>${med.start_date || ''}</td>
            <td>${med.end_date || ''}</td>
            <td>
                <button onclick="deleteMedication(${med.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('searchMedications').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = medications.filter(m =>
        m.patient_name.toLowerCase().includes(searchTerm) ||
        m.drug_name.toLowerCase().includes(searchTerm) ||
        m.dosage.toLowerCase().includes(searchTerm) ||
        m.frequency.toLowerCase().includes(searchTerm)
    );
    const tbody = document.querySelector('#medicationsTable tbody');
    tbody.innerHTML = '';
    filtered.forEach(med => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${med.patient_name}</td>
            <td>${med.drug_name}</td>
            <td>${med.dosage}</td>
            <td>${med.frequency}</td>
            <td>${med.start_date || ''}</td>
            <td>${med.end_date || ''}</td>
            <td>
                <button onclick="deleteMedication(${med.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

async function deleteMedication(id) {
    if (confirm('Are you sure you want to delete this medication?')) {
        try {
            await ipcRenderer.invoke('delete-medication', id);
            await loadMedications();
        } catch (error) {
            console.error('Error deleting medication:', error);
            alert('Failed to delete medication');
        }
    }
}

document.addEventListener('hidden.bs.modal', function (event) {
  // Focus the first input, textarea, or select in the visible section
  const activeSection = document.querySelector('.section.active');
  if (activeSection) {
    const firstInput = activeSection.querySelector('input, textarea, select');
    if (firstInput) firstInput.focus();
  }
});

function displayPatientVitals(vitals) {
    const container = document.getElementById('viewPatientVitals');
    if (vitals && vitals.length > 0) {
        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>BP</th>
                    <th>Pulse</th>
                    <th>Temp</th>
                    <th>RR</th>
                    <th>O2 Sat</th>
                </tr>
            </thead>
            <tbody>
                ${vitals.map(vital => `
                    <tr>
                        <td>${new Date(vital.recorded_at).toLocaleString()}</td>
                        <td>${vital.blood_pressure}</td>
                        <td>${vital.pulse}</td>
                        <td>${vital.temperature}°C</td>
                        <td>${vital.respiratory_rate}</td>
                        <td>${vital.oxygen_saturation}%</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.innerHTML = '';
        container.appendChild(table);
    } else {
        container.innerHTML = '<p class="text-muted">No vital signs recorded</p>';
    }
}

function displayPatientAllergies(allergies) {
    const container = document.getElementById('viewPatientAllergies');
    if (allergies && allergies.length > 0) {
        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Severity</th>
                </tr>
            </thead>
            <tbody>
                ${allergies.map(allergy => `
                    <tr>
                        <td>${allergy.allergy_type}</td>
                        <td>${allergy.description}</td>
                        <td>${allergy.severity}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.innerHTML = '';
        container.appendChild(table);
    } else {
        container.innerHTML = '<p class="text-muted">No allergies recorded</p>';
    }
}

function displayPatientMedications(medications) {
    const container = document.getElementById('viewPatientMedications');
    if (medications && medications.length > 0) {
        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                ${medications.map(med => `
                    <tr>
                        <td>${med.drug_name}</td>
                        <td>${med.dosage}</td>
                        <td>${med.frequency}</td>
                        <td>${med.start_date ? new Date(med.start_date).toLocaleDateString() : ''} - ${med.end_date ? new Date(med.end_date).toLocaleDateString() : 'Ongoing'}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.innerHTML = '';
        container.appendChild(table);
    } else {
        container.innerHTML = '<p class="text-muted">No medications recorded</p>';
    }
}

function displayPatientLabs(labs) {
    const container = document.getElementById('viewPatientLabs');
    if (labs && labs.length > 0) {
        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${labs.map(lab => `
                    <tr>
                        <td>${lab.test_name}</td>
                        <td>${lab.result} ${lab.unit}</td>
                        <td>${new Date(lab.recorded_at).toLocaleDateString()}</td>
                        <td><span class="badge bg-${lab.is_abnormal ? 'danger' : 'success'}">${lab.is_abnormal ? 'Abnormal' : 'Normal'}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.innerHTML = '';
        container.appendChild(table);
    } else {
        container.innerHTML = '<p class="text-muted">No lab results recorded</p>';
    }
}

function displayPatientHistory(history) {
    const container = document.getElementById('viewPatientHistory');
    if (history && history.length > 0) {
        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Diagnosis</th>
                    <th>Condition</th>
                    <th>Procedure</th>
                </tr>
            </thead>
            <tbody>
                ${history.map(h => `
                    <tr>
                        <td>${new Date(h.date_recorded).toLocaleDateString()}</td>
                        <td>${h.diagnosis}</td>
                        <td>${h.chronic_condition || 'N/A'}</td>
                        <td>${h.procedure || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.innerHTML = '';
        container.appendChild(table);
    } else {
        container.innerHTML = '<p class="text-muted">No medical history recorded</p>';
    }
} 