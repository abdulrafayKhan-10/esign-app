# Project Structure

The SigDoc application is organized as a monorepo containing both the frontend and backend applications in separate top-level directories. 

## Root Directory

```text
esign-app/
├── backend/            # Laravel API Application
├── frontend/           # React SPA Application
├── docs/               # Project Documentation
├── .git/               # Source control
├── README.md           # Main project entry documentation
└── ...                 # Deployment/build artifacts (index.html, static/, etc.)
```

## Folder Responsibilities

### `/frontend`
Contains the entire React application. It operates independently of the backend.
- **`package.json`**: Defines frontend npm dependencies and scripts.
- **`public/`**: Contains static assets like `index.html`, `favicon.ico`, and `manifest.json`.
- **`src/`**: The core source code for the React application.
  - **`components/`**: Reusable UI elements (e.g., `Navbar.js`, `SignaturePad.js`).
  - **`pages/`**: Top-level route components (e.g., `Home.js`, `Dashboard.js`).
  - **`context/`**: React context providers (e.g., `AuthContext.js` for global state).
  - **`App.js`**: Defines the application routing and structure.
  - **`api.js`**: Centralized Axios configuration for making API calls.

### `/backend`
Contains the Laravel PHP application acting as the REST API.
- **`composer.json`**: Defines PHP dependencies.
- **`.env`**: Contains all environment variables (database credentials, keys).
- **`app/`**: Core backend logic.
  - **`Http/Controllers/`**: Contains classes that handle incoming API requests.
  - **`Models/`**: Eloquent models representing database tables.
- **`config/`**: Configuration files for the Laravel framework.
- **`database/`**: Migrations, seeders, and factories for database structure setup.
- **`routes/`**: Contains route definition files (`api.php` and `web.php`).
- **`storage/`**: Used for storing generated files, uploaded documents, and framework logs.
- **`public/`**: Contains `index.php`, the main entry point for the backend web server.
