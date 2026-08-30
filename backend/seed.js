const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Review = require('./models/Review');

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const seedData = async () => {
  try {
    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Review.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create restaurant
    const restaurant = await Restaurant.create({
      name: 'CHUNKIES',
      nameHindi: 'चुंकीज़',
      category: 'Fast Food Restaurant',
      address: {
        street: '225, Swami Vivekanand Rd',
        area: 'Collectors Colony, Momin Nagar',
        city: 'Jogeshwari West',
        state: 'Mumbai',
        zipCode: '400102',
        fullAddress: '225, Swami Vivekanand Rd, Collectors Colony, Momin Nagar, Jogeshwari West, Mumbai, Maharashtra 400102'
      },
      phone: '090040 94979',
      priceRange: '₹200–₹400 per person',
      openingHours: 'Open 24 Hours',
      services: ['Dine-in', 'Takeaway', 'Delivery'],
      rating: 4.0,
      reviewCount: 566,
      googleMapsUrl: 'https://maps.google.com/?q=Chunkies+Shop+Jogeshwari+West+Mumbai'
    });
    
    console.log('Restaurant created:', restaurant.name);
    
    // Create menu items with images
    const menuItems = [
      {
        name: 'Mexican Chicken Burger',
        description: 'Juicy crispy chicken with spicy Mexican sauce, fresh vegetables and creamy dressing.',
        price: 199,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: true,
        isAvailable: true,
        rating: 4.5,
        popularity: 95
      },
      {
        name: 'Classic Chicken Burger',
        description: 'Crispy chicken patty with fresh lettuce, tomato, onions and special sauce.',
        price: 179,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1586190848861-99c4a3f7c4f1?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: false,
        isAvailable: true,
        rating: 4.2,
        popularity: 88
      },
      {
        name: 'Crispy Chicken Burger',
        description: 'Extra crispy chicken fillet with cheese, pickles and tangy sauce.',
        price: 189,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: false,
        isAvailable: true,
        rating: 4.3,
        popularity: 82
      },
      {
        name: 'Fish Chunkie Burger',
        description: 'Crispy fish fillet with tartar sauce, lettuce, and cheese.',
        price: 219,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: true,
        isAvailable: true,
        rating: 4.3,
        popularity: 88
      },
      {
        name: 'Chicken Strips',
        description: '6 pieces of crispy golden chicken strips with dipping sauce.',
        price: 179,
        category: 'Chicken',
        image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: true,
        isAvailable: true,
        rating: 4.4,
        popularity: 92
      },
      {
        name: 'Crispy Chicken Wings',
        description: '8 crispy chicken wings with spicy seasoning and dipping sauce.',
        price: 199,
        category: 'Chicken',
        image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: false,
        isAvailable: true,
        rating: 4.5,
        popularity: 85
      },
      {
        name: 'Chicken Nuggets',
        description: '8 pieces of crispy chicken nuggets with Frankie special seasoning.',
        price: 149,
        category: 'Chicken',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: false,
        isAvailable: true,
        rating: 4.2,
        popularity: 85
      },
      {
        name: 'Chicken Wrap',
        description: 'Grilled chicken wrapped in soft roti with fresh veggies and sauce.',
        price: 189,
        category: 'Wraps',
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: false,
        isAvailable: true,
        rating: 4.3,
        popularity: 78
      },
      {
        name: 'Spicy Chicken Wrap',
        description: 'Spicy grilled chicken with peppers, onions and special sauce in a wrap.',
        price: 199,
        category: 'Wraps',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: false,
        isAvailable: true,
        rating: 4.4,
        popularity: 72
      },
      {
        name: 'Loaded Chicken Frankie',
        description: 'Loaded Frankie with chicken, cheese, veggies and special chutney.',
        price: 169,
        category: 'Wraps',
        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: false,
        isAvailable: true,
        rating: 4.1,
        popularity: 68
      },
      {
        name: 'Loaded Fries',
        description: 'Crispy fries topped with cheese, jalapeños, and special sauce.',
        price: 149,
        category: 'Sides',
        image: 'https://images.unsplash.com/photo-1573080496987-a199f8cd75c9?w=400&h=300&fit=crop',
        isVeg: true,
        isFeatured: false,
        isAvailable: true,
        rating: 4.1,
        popularity: 72
      },
      {
        name: 'Classic Fries',
        description: 'Classic crispy golden fries with salt.',
        price: 99,
        category: 'Sides',
        image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop',
        isVeg: true,
        isFeatured: false,
        isAvailable: true,
        rating: 4.0,
        popularity: 90
      },
      {
        name: 'Cheese Fries',
        description: 'Crispy fries topped with melted cheese and herbs.',
        price: 129,
        category: 'Sides',
        image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop',
        isVeg: true,
        isFeatured: false,
        isAvailable: true,
        rating: 4.2,
        popularity: 75
      },
      {
        name: 'Chunkies Classic Combo',
        description: 'Burger + Fries + Drink - perfect meal deal.',
        price: 299,
        category: 'Combos',
        image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: true,
        isAvailable: true,
        rating: 4.5,
        popularity: 82
      },
      {
        name: 'Chicken Craving Combo',
        description: 'Chicken Burger + Chicken Strips + Drink - for chicken lovers.',
        price: 349,
        category: 'Combos',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
        isVeg: false,
        isFeatured: true,
        isAvailable: true,
        rating: 4.6,
        popularity: 78
      }
    ];
    
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);
    
    // Create demo reviews
    const reviews = [
      {
        name: 'Rahul Sharma',
        rating: 5,
        review: 'Frankie nugget was so delicious! Prices are also reasonable. Will definitely come back.',
        isDemo: true
      },
      {
        name: 'Priya Patel',
        rating: 5,
        review: 'Good food!!! Tried Mexican chicken burger, it is recommended! The spices were perfect.',
        isDemo: true
      },
      {
        name: 'Amit Kumar',
        rating: 4,
        review: 'Tasty burgers, wraps, fries and other sides at reasonable prices. Great place for quick bites.',
        isDemo: true
      },
      {
        name: 'Sneha Reddy',
        rating: 4,
        review: 'Fish Chunkie Burger is amazing! Fresh and crispy. The delivery was also on time.',
        isDemo: true
      },
      {
        name: 'Vikram Singh',
        rating: 5,
        review: 'Best chicken strips in Jogeshwari! The portion size is generous and taste is consistent.',
        isDemo: true
      },
      {
        name: 'Neha Gupta',
        rating: 4,
        review: 'Love their loaded fries! Perfect blend of cheese and spices. Great value for money.',
        isDemo: true
      },
      {
        name: 'Rajesh Verma',
        rating: 4,
        review: 'Quick service and good food. The family combo is perfect for weekend treats with family.',
        isDemo: true
      },
      {
        name: 'Anjali Desai',
        rating: 5,
        review: 'Been ordering from Chunkies for months now. Quality has always been consistent. Highly recommended!',
        isDemo: true
      }
    ];
    
    const createdReviews = await Review.insertMany(reviews);
    console.log(`Created ${createdReviews.length} reviews`);
    
    console.log('\n✅ Seed data completed successfully!');
    console.log('\nDemo data summary:');
    console.log(`- Restaurant: ${restaurant.name}`);
    console.log(`- Menu items: ${createdMenuItems.length}`);
    console.log(`- Reviews: ${createdReviews.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
