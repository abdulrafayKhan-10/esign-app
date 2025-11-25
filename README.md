# SigDoc - Digital Signature & E-Signing App

SigDoc is a full-stack web application for creating digital signatures and signing documents electronically.

## Architecture Overview

- **Backend**: Laravel (API, Auth, Storage, MySQL)
- **Frontend**: React (UI, Signature Canvas, Axios)
- **Database**: MySQL

## Prerequisites

- PHP >= 8.1
- Composer
- Node.js & npm
- MySQL

## Setup Instructions

### 1. Backend Setup (Laravel)

```bash
# Navigate to the project root
cd esign-app

# Create Laravel project (if not already created)
composer create-project laravel/laravel backend

# Navigate to backend
cd backend

# Install dependencies (if needed)
composer install

# Set up environment variables
cp .env.example .env
# Edit .env and set your database credentials:
# DB_DATABASE=sigdoc_db
# DB_USERNAME=root
# DB_PASSWORD=

# Generate Application Key
php artisan key:generate

# Run Migrations
php artisan migrate

# Serve the application
php artisan serve
```

### 2. Frontend Setup (React)

```bash
# Navigate to the project root
cd esign-app

# Create React app
npx create-react-app frontend

# Navigate to frontend
cd frontend

# Install dependencies
npm install axios react-router-dom react-signature-canvas

# Start the development server
npm start
```

## Features

- **User Authentication**: Register and Login securely.
- **Signature Creator**: Draw or type your signature and save it.
- **Document Management**: Upload PDF/Doc files.
- **E-Signing**: Overlay your saved signature onto uploaded documents.
- **Download**: Save the signed document.

## Folder Structure

```
esign-app/
├── backend/       # Laravel API
│   ├── app/
│   ├── routes/
│   └── ...
├── frontend/      # React App
│   ├── src/
│   ├── public/
│   └── ...
└── README.md
```