# 🌌 Shoppy (E-Commerce Store)

Shoppy is a premium, next-generation e-commerce web application featuring a futuristic obsidian dark-theme, cyan/pink neon accents, and responsive layout styling. It integrates a Node.js/Express REST API, a MongoDB database, robust validation schemas, and a resilient, developer-friendly **local sandbox failover system**.

---

## 🚀 Key Features

* **Glassmorphic Cyber-Aesthetics**: Responsive CSS with HSL-tuned color palettes, neon accents (`--accent-cyan`, `--accent-pink`, `--accent-green`), glassmorphism overlays, and smooth micro-animations.
* **Theme-Aware Experience**: Real-time theme switching between Cyber-Dark (Default) and Light-Grid modes with matching SVG/Lucide assets.
* **Dynamic Catalog & Filtering**: Seamless category tabs (Peripherals, Wearables, Gear) with instant listing filtering and animated loaders.
* **Dual Authorization Systems**:
  * **Secure Node Portal (Client-Side)**: Register new user nodes and log in with email/password authentication (verified using `bcryptjs` encryption inside MongoDB).
  * **Admin Terminal Override**: Secure backend admin override via JWT & `.env` static keys to access the admin panel.
* **Interactive Checkout Deck**: Complete sliding shopping cart drawer with live subtotal counters, item increment/decrement, and stock capacity limitation checks.
* **Admin Control Console**: Live admin override dashboard to inject new product listings, decommission/delete listings, track node telemetry revenue, and read transaction logs.
* **Smart Hybrid Sandbox Failover**: If MongoDB goes offline or is not configured yet, the backend and frontend gracefully fail over to a local sandboxed memory catalog. Features are still fully operational via a simulated store dataset, allowing instant testing.

---

## 🛠️ Tech Stack

* **Frontend**: Vanilla HTML5 (Semantic elements), Vanilla CSS3 (Custom design properties/variables), Vanilla JavaScript (ES Module structure), Lucide Icons CDN.
* **Backend**: Node.js, Express.js (v5.x router, static file hosting, JSON parsers).
* **Database**: MongoDB, Mongoose ODM.
* **Security & Auth**: JWT (JSON Web Tokens), `bcryptjs` password hashing.
* **Development tooling**: Nodemon (automatic server restarts on file modifications).

---

## 📂 Architecture & File Structure

```text
CodeAlpha_Simple_E-commerce_Store/
│
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB Mongoose database connection client
│   │
│   └── models/
│       ├── Order.js         # Order Mongoose database schema & item validation
│       ├── Product.js       # Product Mongoose database schema & category index
│       └── User.js          # User schema, pre-save hashing hooks, & validation
│
├── public/                  # Static frontend hosting directory
│   ├── css/
│   │   └── style.css        # Core custom CSS, design system tokens, themes & layout
│   │
│   ├── images/
│   │   ├── hero_background.png # Theme-aware futuristic hero overlay background
│   │   └── image.png        # Brand favicon icon
│   │
│   ├── js/
│   │   └── app.js           # Client-side router, cart controllers, & API consumer
│   │
│   └── index.html           # Core single-page application entry point
│
├── .env                     # Local environment configurations (ignored from git)
├── .gitignore               # Version control exclusion file
├── package.json             # NPM package scripts & dependency configurations
├── server.js                # Core entry point (Express setup, routes, & seeding)
└── README.md                # Project architectural documentation (this file)
```

---

## 📊 Database Schemas & Models

### 👤 User Schema
Maintains account credentials for clients logging in via the access portal.
* **`name`**: String, required, trimmed, length 2–50 chars.
* **`email`**: String, required, unique, lowercase, regex-validated for RFC-compliant mail.
* **`password`**: String, required, minimum length 6 chars (automatically hashed via `bcrypt` on schema pre-save hook).
* **`role`**: String, enum `['user', 'admin']`, default `'user'`.

### 📦 Product Schema
Represents the items sold in the store catalog.
* **`title`**: String, required, trimmed, length 2–100 chars.
* **`description`**: String, required, trimmed, maximum 2000 chars.
* **`price`**: Number, required, minimum `0`.
* **`imageUrl`**: String, required, image source link.
* **`stockCount`**: Number, required, minimum `0`, default `0`.
* **`category`**: String, required, indexed for fast routing and filtering.
* **`rating`**: Number, default `4.5`, minimum `1`, maximum `5`.

### 🧾 Order Schema
Tracks client transaction checkout records.
* **`user`**: Reference to User ObjectId, required, indexed.
* **`items`**: Nested array of `OrderItemSchema` containing:
  * `product`: Reference to Product ObjectId, required.
  * `quantity`: Number, required, minimum `1`.
  * `price`: Number (captured price at time of order execution), required.
* **`totalAmount`**: Number, required, minimum `0`.
* **`paymentStatus`**: String, enum `['Pending', 'Paid', 'Failed']`, default `'Pending'`.
* **`status`**: String, enum `['Processing', 'Shipped', 'Delivered', 'Cancelled']`, default `'Processing'`.
* **`shippingAddress`**: Subdocument containing street, city, postalCode, and country (required).

---

## 🔌 API Endpoints Reference

### Catalog Endpoints
* **`GET /api/products`**
  * Retrieves all catalog items. If DB is offline, fails over to serve `sampleProducts` from memory.
* **`POST /api/products`**
  * Registers a new product. Requires a connected database. (Status: `201 Created` on success).
* **`DELETE /api/products/:id`**
  * Deletes a product from database by its database ID.

### Authorization Endpoints
* **`POST /api/auth/client-signup`**
  * Registers a client user. Validates existing email, hashes password, saves to DB, returns JWT token mock.
* **`POST /api/auth/client-login`**
  * Authenticates email and compares password hashes. Returns client role & authentication state.
* **`POST /api/auth/admin-login`**
  * Authenticates admin panel override. Compares input credentials against environment variables (`ADMIN_USERNAME`/`ADMIN_PASSWORD`).

### Transaction Endpoints
* **`POST /api/orders`**
  * Processes cart checkout. Performs transaction checks, ensures product stock is sufficient, decrements database stock count, and persists Order document.
* **`GET /api/admin/orders`**
  * Fetches the entire history log of client orders. Sorts by newest orders first.

---

## ⚙️ Environment Configurations

Create a `.env` file in the root directory and populate it with the following configuration keys:

```env
# Server Listening Port
PORT=5000

# MongoDB URI (Atlas Connection String or local server)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Shoppy?retryWrites=true&w=majority

# Authentication Configuration
JWT_SECRET=dev_jwt_secret_key_12345_do_not_use_in_production

# Frontend Client Origin URL (served by Express or local development server)
CLIENT_URL=http://localhost:5000

# Admin Access Panel Override Credentials
ADMIN_USERNAME=admin123
ADMIN_PASSWORD=admin123
```

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd CodeAlpha_Simple_E-commerce_Store
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   * Create a `.env` file in the root directory matching the **Environment Configurations** section above.

4. **Run the Application**:
   * **Development Mode (Auto-restarts via nodemon)**:
     ```bash
     npm run dev
     ```
   * **Production/Standard Mode**:
     ```bash
     npm start
     ```

5. **Interact with the App**:
   * Open your web browser and go to: **[http://localhost:5000](http://localhost:5000)**.

---

## 🧪 Database & Sandbox Mode Information

The server is built with a dual runtime system for a seamless developer preview experience:

* **MongoDB Connected Mode**: If `MONGO_URI` connects successfully, the database is queried for listings. On first connection, if the database collection is empty, it automatically seeds initial premium products.
* **Local Sandbox Mode**: If MongoDB is offline or unavailable, the console displays a warning banner and fails over to an in-memory client dataset. User catalog loading, product details, cart additions, and local client checkouts remain active in the UI using mock memory structures.
