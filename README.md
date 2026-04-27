KAINÈA: Full-Stack Regional Textile E-Commerce Platform
Deskripsi Proyek
Aplikasi web e-commerce full-stack yang dirancang untuk digitalisasi dan transaksi produk tekstil daerah. Sistem ini dibangun dengan arsitektur client-server yang secara tegas memisahkan antarmuka pengguna (frontend) dari logika pemrosesan data (backend).

Tech Stack & Infrastruktur

Frontend: HTML5, CSS3, Vanilla JavaScript (DOM Manipulation, Fetch API).

Backend: Node.js, Express.js.

Database: MySQL.

Infrastruktur & Deployment: cPanel, LiteSpeed Web Server, Passenger (Node.js App Manager), SSL/HTTPS Enforcement.

Fitur Fungsional

Secure Authentication: Sistem registrasi dan login terintegrasi dengan validasi kredensial di basis data MySQL.

Role-Based Access Control (RBAC): Pemisahan hak akses dan rute antara Administrator dan Pengguna.

State Management: Pengelolaan keranjang belanja (cart) secara dinamis menggunakan local storage dan sinkronisasi data sisi klien.

Resolusi Kendala Teknis (Technical Problem-Solving)
Bagian ini menunjukkan kemampuan adaptasi pada production environment.

Cross-Origin Resource Sharing (CORS) Configuration: Mengamankan pertukaran data pada protokol HTTPS dengan mengonfigurasi header CORS spesifik di Express.js, mencegah pemblokiran Mixed Content oleh peramban modern.

Server Routing & Passenger Integration: Meresolusi isu routing 404 dan 503 HTTP dengan melakukan pemetaan ulang aplikasi Node.js pada Passenger cPanel, serta mengimplementasikan instruksi mod_rewrite via .htaccess untuk mengelola jalur /api.

Environment Variable Management: Mengisolasi dan mengamankan kredensial basis data menggunakan konfigurasi .env, mencegah paparan data sensitif dan menangani parsing karakter khusus pada kata sandi MySQL di tingkat server.