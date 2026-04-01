# Deployment Guide: Panchganga Floodwatch Dashboard

This guide describes how to deploy the **Panchganga Floodwatch Dashboard** to a production environment.

## 1. Prerequisites
- **Node.js**: Version 18.x or 20.x
- **Build Tool**: npm (bundled with Node.js)
- **Web Server**: Apache, Nginx, or any university-managed IIS server.

## 2. Production Build
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run production build**:
    ```bash
    npm run build
    ```
3.  **Output**: The build will create a `dist/` directory in the project root. This directory contains all the static assets (HTML, JS, CSS, and images) necessary to run the dashboard.

## 3. Web Server Configuration

### Apache (University Linux Server)
1.  Copy the contents of the `dist/` folder to the server's web root (e.g., `/var/www/html/panchganga-dashboard`).
2.  Ensure and configure `.htaccess` for modern routing:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /index.html [L]
    </IfModule>
    ```

### Nginx
1.  Copy the `dist/` folder to your server (e.g., `/usr/share/nginx/html/panchganga-dashboard`).
2.  Update your site configuration:
    ```nginx
    location / {
        root   /usr/share/nginx/html/panchganga-dashboard;
        index  index.html index.htm;
        try_files $uri /index.html;
    }
    ```

## 4. LAN / Intranet Deployment
*   **Static IP**: If deploying on a university intranet, ensure the server has a static IP address.
*   **Port Access**: Ensure firewall rules allow inbound traffic on port 80 (HTTP) or 443 (HTTPS).
*   **Cross-Origin (CORS)**: Since the dashboard fetches data directly from ThingSpeak, ensure the university network does not block outgoing requests to `api.thingspeak.com`.

## 5. Post-Deployment Checklist
- [ ] Verify all 5 sensors are visible on the map.
- [ ] Confirm water gauges load properly.
- [ ] Scan the SMS registration QR code to ensure it leads to the correct Google Form.
- [ ] Test the dashboard on both desktop and mobile devices.
- [ ] Record the server's URL/IP for institutional reporting.

---
*For technical support, contact Er. Satwik K. Udupi.*
