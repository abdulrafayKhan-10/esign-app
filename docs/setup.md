# Setup & Installation

This guide explains how to set up the SigDoc application for local development.

## 1. Prerequisites

Before starting, ensure your local environment meets the following requirements:
- **PHP**: >= 8.0.2
- **Composer**: PHP package manager
- **Node.js & npm**: For building the frontend
- **MySQL**: Database server (or any other database supported by Laravel)

## 2. Backend Setup (Laravel)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and create your local configuration.
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and configure your database settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=sigdoc_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Run Database Migrations**:
   This will create the necessary tables in your database.
   ```bash
   php artisan migrate
   ```

6. **Start the local development server**:
   ```bash
   php artisan serve
   ```
   The API will be available at `http://localhost:8000`.

## 3. Frontend Setup (React)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   The React application will be accessible at `http://localhost:3000`.

*Note: The frontend `package.json` includes a `"proxy": "http://localhost:8000"` setting. This ensures that unknown requests (like `/api/...`) made by the frontend in development mode are proxied to the Laravel backend running on port 8000.*

## 4. Environment Variables Overview

The `.env` file in the backend controls the application's configuration. Key variables include:

- `APP_ENV`: Determines if the app is in `local`, `staging`, or `production`.
- `APP_DEBUG`: When `true`, detailed error traces are shown. Must be `false` in production.
- `APP_KEY`: Used for encryption. Generated via artisan.
- `DB_*`: Database connection credentials.
- `MAIL_*`: SMTP configuration for sending emails.
- `AWS_*`: Amazon S3 credentials (if using cloud storage for documents).
- `FILESYSTEM_DISK`: Set to `local` by default, can be changed to `s3` for AWS storage.
