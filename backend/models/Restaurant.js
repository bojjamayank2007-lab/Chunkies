const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'CHUNKIES'
  },
  nameHindi: {
    type: String,
    default: 'चुंकीज़'
  },
  category: {
    type: String,
    default: 'Fast Food Restaurant'
  },
  address: {
    street: String,
    area: String,
    city: String,
    state: String,
    zipCode: String,
    fullAddress: {
      type: String,
      default: '225, Swami Vivekanand Rd, Collectors Colony, Momin Nagar, Jogeshwari West, Mumbai, Maharashtra 400102'
    }
  },
  phone: {
    type: String,
    required: true,
    default: '090040 94979'
  },
  email: {
    type: String
  },
  priceRange: {
    type: String,
    default: '₹200–₹400 per person'
  },
  openingHours: {
    type: String,
    default: 'Open 24 Hours'
  },
  services: [{
    type: String,
    enum: ['Dine-in', 'Takeaway', 'Delivery'],
    default: ['Dine-in', 'Takeaway', 'Delivery']
  }],
  rating: {
    type: Number,
    default: 4.0
  },
  reviewCount: {
    type: Number,
    default: 566
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String
  },
  googleMapsUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
