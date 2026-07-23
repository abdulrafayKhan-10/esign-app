# Frontend Documentation

The SigDoc frontend is a React Single Page Application (SPA) that provides the user interface for document uploading, signature creation, and document signing.

## 1. Technologies & Libraries

- **Framework**: React 19
- **Build Tool**: `react-scripts` (Create React App wrapper over Webpack)
- **Package Manager**: npm
- **Routing**: `react-router-dom` (v7) for client-side routing.
- **HTTP Client**: `axios` for communicating with the Laravel backend.

### Key Third-Party Libraries
- **`react-signature-canvas`**: Used for drawing digital signatures via HTML5 canvas.
- **`react-pdf`**: Used to render PDF documents in the browser so they can be viewed and signed.
- **`react-rnd`**: Provides resizable and draggable components, likely used for positioning signatures on documents.
- **`react-dropzone`**: Facilitates drag-and-drop document uploading.
- **`react-hook-form`**: Manages form state and validation efficiently.
- **`framer-motion`**: Used for UI animations and transitions.
- **`react-toastify`**: Handles non-blocking notification popups (toasts).

## 2. Architecture and State Management

- The application heavily utilizes functional components and React Hooks.
- Global authentication state is managed using the React Context API (`src/context/AuthContext.js`).
- The `<AuthProvider>` wraps the main application to provide login state and user details to any child component.

## 3. Application Entry Point

The frontend entry point is `src/index.js`, which mounts the root `App` component into the `div#root` in `public/index.html`.

## 4. Routing Configuration

Routing is configured in `src/App.js` using `<Router>` and `<Routes>`.

### Public Routes
- `/`: Home page
- `/login`: User login
- `/register`: User registration
- `/about`, `/contact`, `/features`, `/privacy`, `/terms`: Informational pages

### Guest Routes (No auth required)
- `/guest/upload`: Upload documents as a guest.
- `/guest/sign/:id`: Sign a specific document as a guest.

### Protected Routes (Auth required)
Wrapped in a `<ProtectedRoute>` component to ensure the user is logged in:
- `/dashboard`: User's dashboard.
- `/create-signature`: Interface for generating/drawing new signatures.
- `/documents/upload`: Upload new documents.
- `/sign/:id`: Sign a specific uploaded document.
