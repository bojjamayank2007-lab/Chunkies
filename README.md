# CHUNKIES Restaurant Website

A complete full-stack restaurant website for **CHUNKIES (चुंक़ीज़)**, a fast food restaurant in Jogeshwari West, Mumbai. Customers can browse the menu, register and log in, share reviews, build a cart, and place **Cash on Delivery (COD)** or **online (Razorpay)** orders. A separate, fully authenticated admin dashboard handles orders, menu items, reviews, and restaurant settings.

## Tech Stack

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| Frontend     | HTML5, CSS3, Vanilla JavaScript                     |
| Backend      | Node.js, Express.js                                 |
| Database     | MongoDB, Mongoose ODM                               |
| Auth         | JWT stored in HttpOnly cookies                      |
| Payments     | Razorpay integration structure (test mode ready)    |
| Security     | Helmet, express-rate-limit, CORS, input validation  |

## Project Structure

```
CHUNKIES/
│
├── frontend/                  # Customer-facing website
│   ├── index.html             # Home page
│   ├── menu.html              # Menu page
│   ├── cart.html              # Cart & checkout page
│   ├── contact.html           # Contact page
│   ├── about.html             # About page
│   ├── customer-login.html    # Customer login/register page
│   ├── customer-orders.html   # Customer order history page
│   ├── css/                   # Styles: style, navbar, hero, menu, ...
│   ├── js/
│   │   ├── api.js             # API integration (base URL)
│   │   ├── main.js            # Main JavaScript
│   │   ├── navbar.js          # Navigation (auth-aware profile)
│   │   ├── menu.js            # Menu rendering, filters, sorting
│   │   ├── cart.js            # Cart, checkout & Razorpay flow
│   │   ├── reviews.js         # Review rendering
│   │   ├── contact.js         # Contact page logic
│   │   ├── customerAuth.js    # Customer auth helpers
│   │   └── restaurant.js      # Restaurant info loader
│   └── assets/                # Images and icons
│
├── backend/                   # Express REST API
│   ├── server.js              # App entry, middleware, routes & graceful shutdown
│   ├── seed.js                # Demo data seed script
│   ├── seedAdmin.js           # Admin account seed script
│   ├── config/                # MongoDB connection (db.js)
│   ├── models/                # Admin, Customer, MenuItem, Order, Review, Restaurant
│   ├── controllers/           # Request handlers
│   ├── routes/                # API route definitions
│   └── middleware/            # Admin/customer auth + error handling
│
├── admin/                     # Authenticated admin dashboard
│   ├── index.html             # Orders, menu, reviews, settings
│   ├── css/admin.css
│   └── js/admin.js
│
└── README.md
```

## Features

### Customer
- **Customer registration / login / logout** (JWT stored in an HttpOnly cookie)
- **Customer order history** (`customer-orders.html`, backed by `GET /api/orders/my-orders`)
- Browse the menu with category filters, search, and sorting
- Star-rated **reviews** submission and display
- **Cart system — customer login is required to Add to Cart**; guests are prompted to log in
- Checkout with **Cash on Delivery (COD)** or **Online payment**
- **Online payment flow via Razorpay** — the server creates a Razorpay order, the browser opens Razorpay Checkout, and the server verifies the payment signature
- **Mobile / tablet responsive** UI

### Admin
- **Admin authentication** — the dashboard requires login (login screen shown when unauthenticated)
- **Admin dashboard**: statistics and management sections for **orders**, **menu**, **reviews**, and **settings** (restaurant info)
- Orders: view all, view details, update status, delete
- Menu: add, edit, delete menu items
- Reviews: delete inappropriate reviews

### Security & Engineering
- **Server-side order pricing** — subtotal, 5% tax, and total are always calculated from database menu prices; client-sent prices are never trusted
- **Rate limiting** on the API, with stricter limits on **auth login** and **review submissions**
- **Security headers via Helmet**
- **CORS configuration** in development (localhost:8080/8081) and production (`FRONTEND_URL`), with credentials enabled
- **Health check endpoint** — `GET /health` returns `{ "status": "ok" }`
- **Graceful shutdown** on SIGINT/SIGTERM (closes the HTTP server and MongoDB connection)
- JWT tokens in **HttpOnly cookies**; separate **admin** and **customer** tokens with separate middleware
- Passwords hashed with **bcrypt** (12 salt rounds); no passwords in source code
- `.env` is git-ignored and must never be committed

## Requirements

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm

## Installation

```bash
# 1) Install backend dependencies
cd backend
npm install

# 2) Configure environment variables in backend/.env (see below)

# 3) Start MongoDB (macOS Homebrew example)
brew services start mongodb-community

# 4) Seed the database with demo data (restaurant, menu items, reviews)
npm run seed

# 5) Seed the admin account (reads ADMIN_EMAIL / ADMIN_PASSWORD from .env)
npm run seed:admin

# 6) Start the backend
npm start          # or: npm run dev (nodemon)

# 7) Open the website
#   Frontend: frontend/index.html  (or serve the frontend folder)
#   Admin:    admin/index.html     (log in with the seeded admin credentials)
```

> The frontend expects the backend on `http://localhost:5001/api` (see `frontend/js/api.js`). In development the backend's CORS whitelist allows `http://localhost:8080` and `http://localhost:8081`, so serve the frontend/admin on one of those ports for local development.

## Environment Variables

Create `backend/.env` based on the following template:

```
MONGO_URI=mongodb://127.0.0.1:27017/chunkies
PORT=5001
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_string
ADMIN_EMAIL=admin@chunkies.in
ADMIN_PASSWORD=replace_with_a_strong_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
# FRONTEND_URL=http://your-frontend-domain   # REQUIRED in production
```

| Variable               | Description                                                     |
| -----------------------| --------------------------------------------------------------- |
| `MONGO_URI`            | MongoDB connection string                                       |
| `PORT`                 | Backend port (default: **5001**)                                |
| `NODE_ENV`             | `development` or `production`                                   |
| `JWT_SECRET`           | Secret used to sign admin and customer JWTs                     |
| `ADMIN_EMAIL`          | Admin login email (used by `npm run seed:admin`)                |
| `ADMIN_PASSWORD`       | Admin login password (used by `npm run seed:admin`)             |
| `RAZORPAY_KEY_ID`      | Razorpay key ID (use test keys for test mode)                   |
| `RAZORPAY_KEY_SECRET`  | Razorpay key secret (test mode ready)                           |
| `FRONTEND_URL`         | Allowed frontend origin for CORS in production                  |

⚠️ **`.env` contains secrets — never commit it.** It is already listed in `.gitignore`.

## API Overview

Base URL: `http://localhost:5001/api`

### Public endpoints

| Method | Endpoint                       | Description                                      |
| ------ | ------------------------------ | ------------------------------------------------ |
| GET    | `/health`                      | Health check (`{ "status": "ok" }`)              |
| GET    | `/api/menu`                    | List all menu items                              |
| GET    | `/api/menu/:id`                | Get a single menu item                           |
| POST   | `/api/orders`                  | Create an order (COD or online; guests allowed)  |
| POST   | `/api/orders/verify-payment`   | Verify a Razorpay payment signature              |
| GET    | `/api/reviews`                 | List reviews                                     |
| POST   | `/api/reviews`                 | Submit a review (rate-limited)                   |
| GET    | `/api/restaurant`              | Get restaurant info                              |
| POST   | `/api/auth/customer/register`  | Create a customer account                        |
| POST   | `/api/auth/customer/login`     | Log in a customer (sets `customerToken` cookie)  |
| POST   | `/api/auth/customer/logout`    | Log out a customer                               |

### Customer-protected endpoints (require a valid `customerToken` cookie)

| Method | Endpoint                   | Description                                     |
| ------ | -------------------------- | ----------------------------------------------- |
| GET    | `/api/auth/customer/me`    | Get the logged-in customer profile              |
| GET    | `/api/orders/my-orders`    | Get the logged-in customer's order history      |

### Admin-only endpoints (require a valid `adminToken` cookie)

| Method | Endpoint                  | Description                                     |
| ------ | ------------------------- | ----------------------------------------------- |
| POST   | `/api/menu`               | Create a menu item                              |
| PUT    | `/api/menu/:id`           | Update a menu item                              |
| DELETE | `/api/menu/:id`           | Delete a menu item                              |
| GET    | `/api/orders`             | List all orders                                 |
| GET    | `/api/orders/:id`         | Get a single order                              |
| PUT    | `/api/orders/:id`         | Update order status                             |
| DELETE | `/api/orders/:id`         | Delete an order                                 |
| DELETE | `/api/reviews/:id`        | Delete a review                                 |
| PUT    | `/api/restaurant`         | Update restaurant info                          |
| POST   | `/api/auth/login`         | Admin login (sets `adminToken` cookie)          |
| POST   | `/api/auth/logout`        | Admin logout                                    |

## Admin Setup

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`.
2. Run `npm run seed:admin` (`node seedAdmin.js`) to create the admin account. The default admin details are read **directly from `.env`** — there are no hardcoded credentials in the source code.
3. Open `admin/index.html` and log in.

## Security Notes

- **JWT in HttpOnly cookies**: both admin and customer sessions use JWT stored in HttpOnly cookies (not `localStorage`), reducing the risk of XSS-based token theft.
- **Admin and customer tokens are separate**: `adminToken` vs `customerToken` are signed with the same `JWT_SECRET` but carry distinct roles, and are verified by different middleware (`protect` for admins, `protectCustomer`/`optionalCustomerAuth` for customers).
- **No passwords in source code**: passwords are bcrypt-hashed with 12 salt rounds before storage; admin credentials come from `.env`.
- **`.env` must not be committed**: it contains `JWT_SECRET`, Razorpay keys, and admin credentials.
- **Rate limiting** protects auth login and review endpoints from abuse.
- **Helmet** sets common security headers; request bodies are limited to 10kb; order totals are computed server-side from database prices.

## Production Notes

- Set `NODE_ENV=production` so cookies use the `Secure` flag and CORS restricts the origin.
- Set `FRONTEND_URL` to your deployed frontend origin so CORS allows only that domain.
- Replace the **test Razorpay keys** with your real `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- Use a **secure MongoDB URI** (for example MongoDB Atlas or an auth-enabled instance), never a publicly exposed one.
- Use a strong, unique `JWT_SECRET`, and set strong `ADMIN_EMAIL` / `ADMIN_PASSWORD` values before running `seed:admin`.