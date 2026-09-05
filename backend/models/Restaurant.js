const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'CHUNKIES',
    maxlength: 100
  },
  nameHindi: {
    type: String,
    default: 'चुंकीज़',
    maxlength: 100
  },
  category: {
    type: String,
    default: 'Fast Food Restaurant',
    maxlength: 50
  },
  address: {
    street:      { type: String, maxlength: 200 },
    area:        { type: String, maxlength: 100 },
    city:        { type: String, maxlength: 100 },
    state:       { type: String, maxlength: 100 },
    zipCode:     { type: String, maxlength: 20  },
    fullAddress: {
      type: String,
      default: '225, Swami Vivekanand Rd, Collectors Colony, Momin Nagar, Jogeshwari West, Mumbai, Maharashtra 400102',
      maxlength: 500
    }
  },
  phone: {
    type: String,
    required: true,
    default: '090040 94979',
    maxlength: 20
  },
  email: {
    type: String,
    maxlength: 100
  },
  priceRange: {
    type: String,
    default: '₹200–₹400 per person',
    maxlength: 50
  },
  openingHours: {
    type: String,
    default: 'Open 24 Hours',
    maxlength: 100
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
    instagram: { type: String, maxlength: 200 },
    facebook:  { type: String, maxlength: 200 },
    twitter:   { type: String, maxlength: 200 }
  },
  googleMapsUrl: { type: String, maxlength: 500 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
