const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');
const { dialog } = require('electron');

// Initialize database
const db = new Database('./emr.db');

function initializeDatabase() {
  // Patients table
  db.prepare(`CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    sex TEXT,
    contact TEXT,
    address TEXT,
    civil_status TEXT,
    date_of_birth DATE,
    birthplace TEXT,
    primary_language TEXT,
    religion TEXT,
    occupation TEXT,
    usual_healthcare_provider TEXT,
    reason_for_health_contact TEXT,
    attending_physician TEXT,
    weight REAL,
    height REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();

  // Medical history table
  db.prepare(`CREATE TABLE IF NOT EXISTS medical_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    diagnosis TEXT,
    chronic_condition TEXT,
    procedure TEXT,
    date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  )`).run();

  // Allergies table
  db.prepare(`CREATE TABLE IF NOT EXISTS allergies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    allergy_type TEXT,
    description TEXT,
    severity TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  )`).run();

  // Medications table
  db.prepare(`CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    drug_name TEXT,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  )`).run();

  // Vital signs table
  db.prepare(`CREATE TABLE IF NOT EXISTS vital_signs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    blood_pressure TEXT,
    pulse INTEGER,
    temperature REAL,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  )`).run();

  // Lab results table
  db.prepare(`CREATE TABLE IF NOT EXISTS lab_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    test_name TEXT,
    result TEXT,
    unit TEXT,
    reference_range TEXT,
    is_abnormal BOOLEAN,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  )`).run();

  // Appointments table
  db.prepare(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    appointment_date DATETIME,
    reason TEXT,
    status TEXT,
    follow_up_instructions TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  )`).run();
}

initializeDatabase();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setMenuBarVisibility(false); // Hide the menu bar
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Uncomment the following line to open DevTools by default
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Patient IPC handlers
ipcMain.handle('add-patient', async (event, patientData) => {
  return new Promise((resolve, reject) => {
    const { 
      name, age, sex, contact, address, civil_status, date_of_birth, 
      birthplace, primary_language, religion, occupation, 
      usual_healthcare_provider, reason_for_health_contact, attending_physician,
      weight, height
    } = patientData;
    
    db.prepare(`
      INSERT INTO patients (
        name, age, sex, contact, address, civil_status, date_of_birth,
        birthplace, primary_language, religion, occupation,
        usual_healthcare_provider, reason_for_health_contact, attending_physician,
        weight, height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, age, sex, contact, address, civil_status, date_of_birth,
      birthplace, primary_language, religion, occupation,
      usual_healthcare_provider, reason_for_health_contact, attending_physician,
      weight, height
    );
    resolve(db.prepare('SELECT last_insert_rowid()').get().lastInsertId);
  });
});

ipcMain.handle('get-patients', async () => {
  return new Promise((resolve, reject) => {
    const rows = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
    resolve(rows);
  });
});

// Appointment IPC handlers
ipcMain.handle('add-appointment', async (event, appointmentData) => {
  return new Promise((resolve, reject) => {
    const { patient_id, appointment_date, reason, status, follow_up_instructions } = appointmentData;
    db.prepare('INSERT INTO appointments (patient_id, appointment_date, reason, status, follow_up_instructions) VALUES (?, ?, ?, ?, ?)').run(patient_id, appointment_date, reason, status, follow_up_instructions);
    resolve(db.prepare('SELECT last_insert_rowid()').get().lastInsertId);
  });
});

ipcMain.handle('get-appointments', async () => {
  return new Promise((resolve, reject) => {
    const rows = db.prepare(`
      SELECT a.*, p.name as patient_name 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      ORDER BY a.appointment_date DESC
    `).all();
    resolve(rows);
  });
});

ipcMain.handle('get-appointment', async (event, id) => {
    return new Promise((resolve, reject) => {
        const row = db.prepare(`
            SELECT a.*, p.name as patient_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            WHERE a.id = ?
        `).get(id);
        resolve(row);
    });
});

ipcMain.handle('update-appointment', async (event, appointmentData) => {
    return new Promise((resolve, reject) => {
        db.prepare(`
            UPDATE appointments 
            SET patient_id = ?, appointment_date = ?, reason = ?, 
                status = ?, follow_up_instructions = ?
            WHERE id = ?
        `).run(
            appointmentData.patient_id,
            appointmentData.appointment_date,
            appointmentData.reason,
            appointmentData.status,
            appointmentData.follow_up_instructions,
            appointmentData.id
        );
        resolve(db.prepare('SELECT changes()').get().changes);
    });
});

ipcMain.handle('delete-appointment', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
        resolve(db.prepare('SELECT changes()').get().changes);
    });
});

// Vital Signs IPC handlers
ipcMain.handle('add-vital-signs', async (event, vitalSignsData) => {
  return new Promise((resolve, reject) => {
    const { patient_id, blood_pressure, pulse, temperature, respiratory_rate, oxygen_saturation } = vitalSignsData;
    db.prepare('INSERT INTO vital_signs (patient_id, blood_pressure, pulse, temperature, respiratory_rate, oxygen_saturation) VALUES (?, ?, ?, ?, ?, ?)').run(patient_id, blood_pressure, pulse, temperature, respiratory_rate, oxygen_saturation);
    resolve(db.prepare('SELECT last_insert_rowid()').get().lastInsertId);
  });
});

ipcMain.handle('get-vital-signs', async () => {
    return new Promise((resolve, reject) => {
        const rows = db.prepare(`
            SELECT v.*, p.name as patient_name 
            FROM vital_signs v 
            JOIN patients p ON v.patient_id = p.id 
            ORDER BY v.recorded_at DESC
        `).all();
        resolve(rows);
    });
});

ipcMain.handle('get-vital-signs-by-id', async (event, id) => {
    return new Promise((resolve, reject) => {
        const row = db.prepare(`
            SELECT v.*, p.name as patient_name 
            FROM vital_signs v 
            JOIN patients p ON v.patient_id = p.id 
            WHERE v.id = ?
        `).get(id);
        resolve(row);
    });
});

ipcMain.handle('update-vital-signs', async (event, vitalSignsData) => {
    return new Promise((resolve, reject) => {
        try {
            // First check if the patient exists
            const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(vitalSignsData.patient_id);
            if (!patient) {
                reject(new Error('Patient not found'));
                return;
            }

            // Then update the vital signs
            const result = db.prepare(`
                UPDATE vital_signs 
                SET patient_id = ?, blood_pressure = ?, pulse = ?, 
                    temperature = ?, respiratory_rate = ?, oxygen_saturation = ?
                WHERE id = ?
            `).run(
                vitalSignsData.patient_id,
                vitalSignsData.blood_pressure,
                vitalSignsData.pulse,
                vitalSignsData.temperature,
                vitalSignsData.respiratory_rate,
                vitalSignsData.oxygen_saturation,
                vitalSignsData.id
            );

            if (result.changes === 0) {
                reject(new Error('Vital signs record not found'));
                return;
            }

            resolve(result.changes);
        } catch (error) {
            reject(error);
        }
    });
});

ipcMain.handle('delete-vital-signs', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.prepare('DELETE FROM vital_signs WHERE id = ?').run(id);
        resolve(db.prepare('SELECT changes()').get().changes);
    });
});

// Lab Results IPC handlers
ipcMain.handle('add-lab-result', async (event, labResultData) => {
  return new Promise((resolve, reject) => {
    const { patient_id, test_name, result, unit, reference_range, is_abnormal } = labResultData;
    db.prepare('INSERT INTO lab_results (patient_id, test_name, result, unit, reference_range, is_abnormal) VALUES (?, ?, ?, ?, ?, ?)').run(patient_id, test_name, result, unit, reference_range, is_abnormal ? 1 : 0);
    resolve(db.prepare('SELECT last_insert_rowid()').get().lastInsertId);
  });
});

ipcMain.handle('get-lab-results', async () => {
  return new Promise((resolve, reject) => {
    const rows = db.prepare(`
      SELECT l.*, p.name as patient_name 
      FROM lab_results l 
      JOIN patients p ON l.patient_id = p.id 
      ORDER BY l.recorded_at DESC
    `).all();
    resolve(rows);
  });
});

ipcMain.handle('get-lab-result', async (event, id) => {
    return new Promise((resolve, reject) => {
        const row = db.prepare(`
            SELECT l.*, p.name as patient_name 
            FROM lab_results l 
            JOIN patients p ON l.patient_id = p.id 
            WHERE l.id = ?
        `).get(id);
        resolve(row);
    });
});

ipcMain.handle('update-lab-result', async (event, labResultData) => {
    return new Promise((resolve, reject) => {
        db.prepare(`
            UPDATE lab_results 
            SET patient_id = ?, test_name = ?, result = ?, 
                unit = ?, reference_range = ?, is_abnormal = ?
            WHERE id = ?
        `).run(
            labResultData.patient_id,
            labResultData.test_name,
            labResultData.result,
            labResultData.unit,
            labResultData.reference_range,
            labResultData.is_abnormal ? 1 : 0,
            labResultData.id
        );
        resolve(db.prepare('SELECT changes()').get().changes);
    });
});

ipcMain.handle('delete-lab-result', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.prepare('DELETE FROM lab_results WHERE id = ?').run(id);
        resolve(db.prepare('SELECT changes()').get().changes);
    });
});

// IPC Handlers
ipcMain.handle('get-patient', async (event, id) => {
    return new Promise((resolve, reject) => {
        const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
        resolve(row);
    });
});

ipcMain.handle('get-patient-vitals', async (event, patientId) => {
    return new Promise((resolve, reject) => {
        const rows = db.prepare(`
            SELECT vs.*, p.name as patient_name 
            FROM vital_signs vs
            JOIN patients p ON vs.patient_id = p.id
            WHERE vs.patient_id = ?
            ORDER BY vs.recorded_at DESC
            LIMIT 5
        `).all(patientId);
        resolve(rows);
    });
});

ipcMain.handle('get-patient-history', async (event, patientId) => {
    return new Promise((resolve, reject) => {
        const rows = db.prepare(`
            SELECT mh.*, p.name as patient_name 
            FROM medical_history mh
            JOIN patients p ON mh.patient_id = p.id
            WHERE mh.patient_id = ?
            ORDER BY mh.date_recorded DESC
            LIMIT 5
        `).all(patientId);
        resolve(rows);
    });
});

ipcMain.handle('get-patient-labs', async (event, patientId) => {
    return new Promise((resolve, reject) => {
        const rows = db.prepare(`
            SELECT lr.*, p.name as patient_name 
            FROM lab_results lr
            JOIN patients p ON lr.patient_id = p.id
            WHERE lr.patient_id = ?
            ORDER BY lr.recorded_at DESC
            LIMIT 5
        `).all(patientId);
        resolve(rows);
    });
});

ipcMain.handle('update-patient', async (event, patientData) => {
  return new Promise((resolve, reject) => {
    const { 
      id, name, age, sex, contact, address, civil_status, date_of_birth,
      birthplace, primary_language, religion, occupation,
      usual_healthcare_provider, reason_for_health_contact, attending_physician,
      weight, height
    } = patientData;
    
    db.prepare(`
      UPDATE patients 
      SET name = ?, age = ?, sex = ?, contact = ?, address = ?,
          civil_status = ?, date_of_birth = ?, birthplace = ?,
          primary_language = ?, religion = ?, occupation = ?,
          usual_healthcare_provider = ?, reason_for_health_contact = ?,
          attending_physician = ?, weight = ?, height = ?
      WHERE id = ?
    `).run(
      name, age, sex, contact, address, civil_status, date_of_birth,
      birthplace, primary_language, religion, occupation,
      usual_healthcare_provider, reason_for_health_contact, attending_physician,
      weight, height, id
    );
    resolve(db.prepare('SELECT changes()').get().changes);
  });
});

ipcMain.handle('delete-patient', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.prepare('BEGIN TRANSACTION').run();
        
        // Delete related records first
        db.prepare('DELETE FROM vital_signs WHERE patient_id = ?').run(id);
        db.prepare('DELETE FROM lab_results WHERE patient_id = ?').run(id);
        db.prepare('DELETE FROM appointments WHERE patient_id = ?').run(id);
        db.prepare('DELETE FROM medical_history WHERE patient_id = ?').run(id);
        db.prepare('DELETE FROM allergies WHERE patient_id = ?').run(id);
        db.prepare('DELETE FROM medications WHERE patient_id = ?').run(id);
        
        // Finally delete the patient
        db.prepare('DELETE FROM patients WHERE id = ?').run(id, function() {
            db.prepare('COMMIT').run();
            resolve(db.prepare('SELECT changes()').get().changes);
        });
    });
});

// Medical History IPC handlers
ipcMain.handle('add-medical-history', async (event, historyData) => {
  return new Promise((resolve, reject) => {
    const { patient_id, diagnosis, chronic_condition, procedure, date_recorded } = historyData;
    db.prepare('INSERT INTO medical_history (patient_id, diagnosis, chronic_condition, procedure, date_recorded) VALUES (?, ?, ?, ?, ?)').run(patient_id, diagnosis, chronic_condition, procedure, date_recorded);
    resolve(db.prepare('SELECT last_insert_rowid()').get().lastInsertId);
  });
});

ipcMain.handle('get-medical-history', async () => {
  return new Promise((resolve, reject) => {
    const rows = db.prepare(`
      SELECT mh.*, p.name as patient_name 
      FROM medical_history mh 
      JOIN patients p ON mh.patient_id = p.id 
      ORDER BY mh.date_recorded DESC
    `).all();
    resolve(rows);
  });
});

ipcMain.handle('update-medical-history', async (event, historyData) => {
    return new Promise((resolve, reject) => {
        const { id, patient_id, diagnosis, chronic_condition, procedure, date_recorded } = historyData;
        console.log('Updating medical history:', historyData); // Debug log

        const result = db.prepare(`
            UPDATE medical_history 
             SET patient_id = ?, 
                 diagnosis = ?, 
                 chronic_condition = ?, 
                 procedure = ?, 
                 date_recorded = ? 
             WHERE id = ?
        `).run(patient_id, diagnosis, chronic_condition, procedure, date_recorded, id);
        if (result.changes > 0) {
            console.log('Medical history updated successfully. Changes:', result.changes);
            resolve(true);
        } else {
            console.error('Error updating medical history: No rows updated. ID:', id);
            reject(new Error('Update failed'));
        }
    });
});

ipcMain.handle('delete-medical-history', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.prepare('DELETE FROM medical_history WHERE id = ?').run(id);
    resolve(db.prepare('SELECT changes()').get().changes);
  });
});

// Allergies IPC handlers
ipcMain.handle('add-allergy', async (event, allergyData) => {
    return new Promise((resolve, reject) => {
        const { patient_id, allergy_type, description, severity } = allergyData;
        db.prepare('INSERT INTO allergies (patient_id, allergy_type, description, severity) VALUES (?, ?, ?, ?)').run(patient_id, allergy_type, description, severity);
        resolve(db.prepare('SELECT last_insert_rowid()').get().lastInsertId);
    });
});

ipcMain.handle('get-allergies', async () => {
    return new Promise((resolve, reject) => {
        const rows = db.prepare(`
            SELECT a.*, p.name as patient_name 
            FROM allergies a 
            JOIN patients p ON a.patient_id = p.id 
            ORDER BY a.allergy_type
        `).all();
        resolve(rows);
    });
});

ipcMain.handle('update-allergy', async (event, allergyData) => {
    return new Promise((resolve, reject) => {
        db.prepare(`
            UPDATE allergies 
            SET patient_id = ?, allergy_type = ?, description = ?, severity = ?
            WHERE id = ?
        `).run(
            allergyData.patient_id,
            allergyData.allergy_type,
            allergyData.description,
            allergyData.severity,
            allergyData.id
        );
        resolve(db.prepare('SELECT changes()').get().changes);
    });
});

ipcMain.handle('delete-allergy', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.prepare('DELETE FROM allergies WHERE id = ?').run(id);
        resolve(db.prepare('SELECT changes()').get().changes);
    });
});

// Medications IPC handlers
ipcMain.handle('add-medication', async (event, medData) => {
    return new Promise((resolve, reject) => {
        const { patient_id, drug_name, dosage, frequency, start_date, end_date } = medData;
        db.prepare('INSERT INTO medications (patient_id, drug_name, dosage, frequency, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)').run(patient_id, drug_name, dosage, frequency, start_date, end_date);
        resolve(db.prepare('SELECT last_insert_rowid()').get().lastInsertId);
    });
});
console.log('add-medication handler registered');

ipcMain.handle('get-medications', async () => {
    return new Promise((resolve, reject) => {
        const rows = db.prepare(`
            SELECT m.*, p.name as patient_name
            FROM medications m
            JOIN patients p ON m.patient_id = p.id
            ORDER BY m.start_date DESC
        `).all();
        resolve(rows);
    });
});

ipcMain.handle('delete-medication', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.prepare('DELETE FROM medications WHERE id = ?').run(id);
        resolve(db.prepare('SELECT changes()').get().changes);
    });
});

ipcMain.handle('get-patient-medications', async (event, patientId) => {
    return new Promise((resolve, reject) => {
        const rows = db.prepare(`
            SELECT * FROM medications
            WHERE patient_id = ?
            ORDER BY start_date DESC
            LIMIT 5
        `).all(patientId);
        resolve(rows);
    });
});

ipcMain.handle('get-patient-allergies', async (event, patientId) => {
    return new Promise((resolve, reject) => {
        const rows = db.prepare(`
            SELECT * FROM allergies
            WHERE patient_id = ?
            ORDER BY id DESC
            LIMIT 5
        `).all(patientId);
        resolve(rows);
    });
});
