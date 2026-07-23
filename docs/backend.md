# Backend Documentation

The SigDoc backend is a Laravel application providing a RESTful API for the frontend client. It manages business logic, database transactions, authentication, and document processing.

## 1. Technologies & Architecture

- **Framework**: Laravel (v9+)
- **Language**: PHP 8.0+
- **Database**: MySQL (configured via Eloquent ORM)
- **Dependency Manager**: Composer

### Key Third-Party Libraries
- **`setasign/fpdf` & `setasign/fpdi`**: Used for parsing and manipulating existing PDF files. This is core to the application's functionality of "stamping" user signatures onto uploaded PDF documents.
- **`laravel/sanctum`**: Provides lightweight authentication for SPAs, issuing tokens for authenticated API requests.

## 2. Application Entry Point

The main entry point for the backend is the `public/index.php` file. The web server (Apache/Nginx) directs all requests here, which then bootstraps the Laravel framework.

## 3. Routing Configuration

API Routes are defined in `routes/api.php`. All routes in this file are automatically prefixed with `/api` by the Laravel `RouteServiceProvider`.

### Key API Routes:

**Public Routes:**
- `POST /register`: Handled by `AuthController@register`
- `POST /login`: Handled by `AuthController@login`

**Guest Document Routes:**
- `POST /guest/documents/upload`: Upload document as guest.
- `POST /guest/documents/{id}/add-signature`: Add a signature to a guest document.
- `POST /guest/documents/{id}/finalize`: Complete the signing process for a guest.

**Protected Routes (Require Sanctum Auth):**
Protected routes use the `auth:sanctum` middleware.
- `GET /user`: Returns current user info.
- `GET|POST|DELETE /signatures`: Managed by `SignatureController`.
- `GET|POST|DELETE /documents`: Managed by `DocumentController`.
- Signature application routes (e.g., `POST /documents/{id}/add-signature`, `POST /documents/{id}/finalize`).

*Note: `routes/web.php` is minimally used, primarily exposing a generic route to serve stored files via the `FileServingController`.*

## 4. Controllers

Located in `app/Http/Controllers`:
- **`AuthController`**: Manages user login, registration, and token generation.
- **`DocumentController`**: Handles uploading documents, retrieving documents, placing signatures on specific coordinates, and finalizing the PDF via FPDI/FPDF.
- **`SignatureController`**: Manages storing, retrieving, and deleting a user's saved digital signatures.
- **`ContactController`**: Processes contact form submissions.

## 5. Configuration Files

Key configuration files are located in the `config/` directory:
- `config/database.php`: Database connection settings (reads from `.env`).
- `config/filesystems.php`: Manages storage disks (local storage vs S3).
- `config/cors.php`: Cross-Origin Resource Sharing settings, critical for allowing the React frontend to communicate with the API.
