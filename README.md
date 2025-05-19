# Electronic Medical Records (EMR) System

A desktop-based Electronic Medical Records system built with Electron, designed to help healthcare providers manage patient records, appointments, and clinical data efficiently.

## Features

- **Patient Management**
  - Comprehensive patient demographics
  - Medical history tracking
  - Contact information management

- **Appointment System**
  - Schedule and manage appointments
  - Track appointment status
  - Follow-up instructions

- **Clinical Data Management**
  - Vital signs recording and tracking
  - Lab results management
  - Medication tracking
  - Allergy documentation

- **Search and Filter**
  - Real-time search across all sections
  - Filtered views of patient data

## Technology Stack

- **Frontend**
  - Electron
  - HTML5
  - CSS3 (Bootstrap 5)
  - JavaScript

- **Backend**
  - Node.js
  - SQLite (better-sqlite3)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/emr-app.git
   cd emr-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Development

- Run in development mode:
  ```bash
  npm run dev
  ```

- Build the application:
  ```bash
  npm run build
  ```

## Project Structure

```
emr-app/
├── src/
│   ├── main.js           # Main process
│   ├── renderer.js       # Renderer process
│   ├── index.html        # Main window
│   └── styles/           # CSS styles
├── public/              # Static assets
├── package.json         # Project configuration
└── README.md           # Documentation
```

## Database Schema

The application uses SQLite with the following main tables:
- patients
- medical_history
- allergies
- medications
- vital_signs
- lab_results
- appointments


## License

This project is licensed under the ISC License.

## Security

- The application stores data locally using SQLite
- No sensitive data is transmitted over the network
- All database operations use prepared statements to prevent SQL injection

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments
In Collaboration with
BS Nursing 2C Group 3
