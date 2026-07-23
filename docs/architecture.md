# Architecture Overview

SigDoc uses a decoupled, client-server architecture consisting of a React-based Single Page Application (SPA) on the frontend and a Laravel REST API on the backend.

## 1. High-Level Architecture

- **Frontend (Client)**: A React SPA that runs in the user's browser. It is responsible for all UI rendering, routing, client-side validation, and document rendering (via `react-pdf`). It communicates with the backend exclusively over HTTP using the `axios` library.
- **Backend (Server)**: A Laravel PHP application that serves as a RESTful API. It handles business logic, authentication, document processing (via FPDF/FPDI), and database interactions.
- **Database**: A MySQL database used for persistent storage of users, signatures, and document metadata.

## 2. Request Lifecycle

1. **Client Interaction**: A user interacts with the React frontend (e.g., uploading a document or signing one).
2. **API Request**: The frontend makes an asynchronous HTTP request (e.g., `POST /api/documents/{id}/sign`) using `axios` to the Laravel backend.
3. **Routing**: The request hits the Laravel server and is routed via `routes/api.php` to the appropriate controller.
4. **Processing**: The controller (e.g., `DocumentController`) processes the request, interacts with the database via Eloquent Models, and performs necessary file operations on the local storage disk.
5. **Response**: The backend returns a JSON response (or file stream) to the frontend.
6. **State Update**: The React frontend updates its state based on the response and re-renders the UI accordingly.

## 3. Application Entry Points

- **Frontend**: 
  - The browser loads `public/index.html`.
  - The JavaScript entry point is `src/index.js`, which renders the root `<App />` component into the DOM.
- **Backend**:
  - All web requests are directed to `public/index.php` (handled by the web server, e.g., Nginx or Apache).
  - The Laravel application bootstrap process routes API requests through `routes/api.php`.

## 4. Key Technologies & Frameworks

### Frontend
- **Framework**: React 19
- **Routing**: React Router DOM (Client-side routing)
- **State Management**: React Context API (`AuthContext`)
- **Build Tool**: Webpack (via `react-scripts` / Create React App)

### Backend
- **Framework**: Laravel 9+ (PHP 8.0+)
- **Authentication**: Laravel Sanctum (Token-based API auth)
- **Database ORM**: Eloquent (ActiveRecord implementation)
- **PDF Processing**: FPDI / FPDF

## 5. Security and Authentication

- The backend exposes a `/api/login` route that returns an authentication token.
- The frontend stores this token and attaches it as a `Bearer` token in the `Authorization` header of subsequent Axios requests.
- Protected routes on the frontend (e.g., `/dashboard`) verify authentication state via the `AuthContext` before rendering.
