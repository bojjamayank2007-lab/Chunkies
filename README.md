# CHUNKIES Restaurant Website

A complete, production-quality full-stack restaurant website for CHUNKIES (चुंकीज़), a fast food restaurant in Jogeshwari West, Mumbai.

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome (icons)
- Fetch API

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

## Project Structure

```
CHUNKIES/
│
├── frontend/
│   ├── index.html          # Home page
│   ├── menu.html           # Menu page
│   ├── about.html          # About page
│   ├── contact.html        # Contact page
│   ├── cart.html           # Checkout page
│   │
│   ├── css/
│   │   ├── style.css       # Base styles
│   │   ├── navbar.css      # Navigation styles
│   │   ├── hero.css        # Hero section styles
│   │   ├── menu.css        # Menu section styles
│   │   ├── reviews.css     # Reviews section styles
│   │   ├── footer.css      # Footer styles
│   │   └── responsive.css  # Responsive styles
│   │
│   ├── js/
│   │   ├── main.js         # Main JavaScript
│   │   ├── navbar.js       # Navigation functionality
│   │   ├── menu.js         # Menu functionality
│   │   ├── cart.js         # Shopping cart functionality
│   │   ├── reviews.js      # Reviews functionality
│   │   ├── contact.js      # Checkout form functionality
│   │   └── api.js          # API integration
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   ├── .env                # Environment variables
│   ├── seed.js             # Database seed script
│   │
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   │
│   ├── models/



│   │   ├── MenuItem.js     # Menu item model
│   │   ├── Order.js        # Order model
│   │   ├── Review.js       # Review model
│   │   └── Restaurant.js   # Restaurant info model
│   │
│   ├── routes/
│   │   ├── menuRoutes.js   # Menu API routes
│   │   ├── orderRoutes.js  # Order API routes
│   │   ├── reviewRoutes.js # Review API routes
│   │   └── restaurantRoutes.js # Restaurant API routes
│   │
│   ├── controllers/
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   └── restaurantController.js
│   │
│   └── middleware/
│       └── errorMiddleware.js # Error handling
│
├── admin/
│   ├── index.html          # Admin dashboard
│   ├── css/
│   │   └── admin.css       # Admin styles
│   └── js/
│       └── admin.js        # Admin functionality
│
├── README.md
└── .gitignore
```

## Requirements

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone/Download the Project

```bash
cd /Users/mayankbojja/CascadeProjects/CHUNKIES
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

The `.env` file is already configured with default values:

```
MONGO_URI=mongodb://127.0.0.1:27017/chunkies
PORT=5000
NODE_ENV=development
```

If your MongoDB is running on a different port or host, update the `MONGO_URI` accordingly.

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# Start MongoDB from the Services panel
```

### 5. Run Seed Script

Populate the database with demo data:

```bash
node seed.js
```

This will create:
- Restaurant information
- 17 demo menu items
- 8 demo reviews

### 6. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The backend will start on `http://localhost:5000`

### 7. Open the Frontend

Open `frontend/index.html` in your browser:

```bash
# On macOS
open frontend/index.html

# On Linux
xdg-open frontend/index.html

# On Windows
start frontend/index.html
```

Or simply navigate to the file in your browser.

### 8. Access Admin Dashboard

Open `admin/index.html` in your browser to access the admin dashboard.

## API Documentation

### Menu Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/menu` | Get all menu items (supports query params: category, search, sort) |
| GET | `/api/menu/:id` | Get single menu item |
| POST | `/api/menu` | Create new menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |

### Order Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |

### Review Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/reviews` | Get all reviews |
| POST | `/api/reviews` | Create new review |
| DELETE | `/api/reviews/:id` | Delete review |

### Restaurant Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/restaurant` | Get restaurant information |
| PUT | `/api/restaurant` | Update restaurant information |

## Features

### Frontend
- **Responsive Design**: Mobile-first approach with hamburger menu
- **Dynamic Menu**: Menu items loaded from backend API
- **Search & Filter**: Search by name/description, filter by category, sort by price/popularity
- **Shopping Cart**: Add/remove items, quantity controls, LocalStorage persistence
- **Checkout**: Complete order form with validation
- **Reviews**: Display customer reviews with ratings
- **Animations**: Smooth transitions and hover effects

### Admin Dashboard
- **Dashboard Overview**: Stats for orders, revenue, menu items
- **Order Management**: View orders, update status, view details
- **Menu Management**: Add, edit, delete menu items
- **Review Management**: View and delete reviews
- **Restaurant Settings**: Update restaurant information

### Backend
- **RESTful API**: Clean API structure with proper HTTP methods
- **MongoDB Integration**: Mongoose models with validation
- **Error Handling**: Centralized error middleware
- **Security**: Order totals calculated on backend (not trusted from frontend)
- **CORS**: Configured for cross-origin requests

## Demo Data

The seed script includes:

### Restaurant Info
- Name: CHUNKIES (चुंकीज़)
- Address: 225, Swami Vivekanand Rd, Jogeshwari West, Mumbai
- Phone: 090040 94979
- Rating: 4.0/5 (566+ reviews)
- Hours: Open 24 Hours

### Menu Items (17 items)
- Burgers: Mexican Chicken Burger, Fish Chunkie Burger, Classic Cheese Burger, Veggie Burger
- Chicken: Chicken Strips, Frankie Nuggets, Peri Peri Chicken
- Wraps: Chicken Wrap, Paneer Wrap
- Sides: Loaded Fries, Regular Fries, Onion Rings
- Combos: Family Combo, Duo Combo
- Drinks: Coca Cola, Pepsi, Fresh Lime Soda

### Reviews (8 demo reviews)
- Customer testimonials with ratings 4-5 stars

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Authentication**: The current admin dashboard has no authentication. Add authentication middleware before deploying to production.

2. **API Security**: All endpoints are currently public. Implement proper authentication and authorization.

3. **Environment Variables**: Never commit `.env` file to version control. Use different values for production.

4. **Input Validation**: While basic validation is implemented, add comprehensive sanitization for production.

5. **Payment Integration**: This demo does not include real payment processing. Integrate a payment gateway (Razorpay, Stripe, etc.) for production.

6. **Delivery Integration**: No real delivery tracking is implemented. Integrate with delivery services for production.

## Development

### Adding New Menu Items

1. Access admin dashboard at `admin/index.html`
2. Navigate to Menu section
3. Click "Add Item"
4. Fill in the details and save

### Managing Orders

1. Access admin dashboard
2. Navigate to Orders section
3. View order details by clicking the eye icon
4. Update order status using the dropdown
5. Delete orders if needed

### Customizing Styles

All styles are in `frontend/css/`. The main color variables are defined in `style.css`:

```css
:root {
    --primary-color: #ff6b35;
    --primary-dark: #e55a2b;
    --secondary-color: #1a1a1a;
    /* ... more variables */
}
```

## Troubleshooting

### MongoDB Connection Error

If you see "MongoDB Connection Error":
- Ensure MongoDB is running
- Check the `MONGO_URI` in `.env`
- Verify MongoDB is accessible on the specified port

### Backend Not Starting

If the backend fails to start:
- Ensure all dependencies are installed (`npm install`)
- Check if port 5000 is already in use
- Review the error message in terminal

### Frontend Not Loading Data

If the frontend shows loading errors:
- Ensure the backend is running on `http://localhost:5000`
- Check browser console for API errors
- Verify CORS is configured correctly

### Seed Script Issues

If the seed script fails:
- Ensure MongoDB is running
- Try dropping the database and running again
- Check for duplicate key errors

## License

This project is created as a demo for CHUNKIES restaurant. All rights reserved.

## Support

For issues or questions, please contact the development team.

---

**Note**: This is a demo website. For production deployment, implement proper security measures, authentication, and payment processing.
