# SigDoc Deployment Guide

This guide covers deploying the SigDoc application (Laravel Backend + React Frontend).

## 1. Backend Deployment (Laravel)

You can deploy Laravel to any PHP-supported hosting (DigitalOcean, Heroku, AWS, Shared Hosting).

### Requirements
- PHP >= 8.1
- Composer
- MySQL/MariaDB
- Nginx/Apache

### Steps (General Linux/VPS)

1.  **Clone Repository**:
    ```bash
    git clone <your-repo-url>
    cd esign-app/backend
    ```

2.  **Install Dependencies**:
    ```bash
    composer install --optimize-autoloader --no-dev
    ```

3.  **Environment Setup**:
    - Copy `.env.example` to `.env`.
    - Set `APP_ENV=production`.
    - Set `APP_DEBUG=false`.
    - Configure Database (`DB_HOST`, `DB_DATABASE`, etc.).
    - Generate key: `php artisan key:generate`.

4.  **Permissions**:
    ```bash
    chmod -R 775 storage bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache
    ```

5.  **Database**:
    ```bash
    php artisan migrate --force
    ```

6.  **Web Server (Nginx Example)**:
    Point your Nginx root to `/path/to/backend/public`.
    ```nginx
    server {
        listen 80;
        server_name api.yourdomain.com;
        root /var/www/esign-app/backend/public;

        index index.php;

        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        }
    }
    ```

7.  **CORS**:
    Ensure `config/cors.php` includes your frontend domain in `allowed_origins`.

## 2. Frontend Deployment (React)

You can deploy React to Vercel, Netlify, or serve it from the same server.

### Option A: Vercel/Netlify (Recommended)

1.  **Push code to GitHub**.
2.  **Import Project** in Vercel/Netlify.
3.  **Build Settings**:
    - Root Directory: `frontend`
    - Build Command: `npm run build`
    - Output Directory: `build`
4.  **Environment Variables**:
    - Add `REACT_APP_API_URL` = `https://api.yourdomain.com/api` (Your deployed backend URL).

### Option B: Serve from Laravel

1.  **Build React App**:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
2.  **Move Files**:
    Copy contents of `frontend/build` to `backend/public`.
3.  **Laravel Route**:
    Add a catch-all route in `routes/web.php` to serve `index.html`.

## 3. Troubleshooting

### Common Issues

-   **CORS Errors**:
    -   Check `backend/config/cors.php`.
    -   Ensure `allowed_origins` matches your frontend URL exactly (http vs https, trailing slashes).
    -   Clear config cache: `php artisan config:clear`.

-   **404 on API Calls**:
    -   Ensure Nginx is configured to rewrite requests to `index.php`.
    -   Check if `REACT_APP_API_URL` is correct.

-   **File Upload Errors**:
    -   Check `upload_max_filesize` and `post_max_size` in `php.ini`.
    -   Ensure `storage/app/public` is writable.
    -   Run `php artisan storage:link`.

-   **500 Internal Server Error**:
    -   Check `backend/storage/logs/laravel.log`.
    -   Verify `.env` database credentials.
