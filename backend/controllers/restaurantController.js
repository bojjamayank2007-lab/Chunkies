const Restaurant = require('../models/Restaurant');

// @desc    Get restaurant info
// @route   GET /api/restaurant
// @access  Public
const getRestaurantInfo = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    
    if (!restaurant) {
      // Create default restaurant if none exists
      restaurant = await Restaurant.create({});
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Update restaurant info
// @route   PUT /api/restaurant
// @access  Admin only
const updateRestaurantInfo = async (req, res) => {
  try {
    const { name, nameHindi, category, address, phone, email, priceRange, openingHours, services, socialMedia, googleMapsUrl } = req.body;
    
    // Name validation
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({ message: 'Restaurant name must be between 2 and 100 characters' });
      }
    }

    // nameHindi validation (if provided)
    if (nameHindi !== undefined && nameHindi !== null && nameHindi !== '') {
      if (typeof nameHindi !== 'string' || nameHindi.trim().length > 100) {
        return res.status(400).json({ message: 'nameHindi must be a string of max 100 characters' });
      }
    }

    // category validation (if provided)
    if (category !== undefined && category !== null && category !== '') {
      if (typeof category !== 'string' || category.trim().length > 50) {
        return res.status(400).json({ message: 'Category must be a string of max 50 characters' });
      }
    }

    // priceRange validation (if provided)
    if (priceRange !== undefined && priceRange !== null && priceRange !== '') {
      if (typeof priceRange !== 'string' || priceRange.trim().length > 50) {
        return res.status(400).json({ message: 'Price range must be a string of max 50 characters' });
      }
    }

    // openingHours validation (if provided)
    if (openingHours !== undefined && openingHours !== null && openingHours !== '') {
      if (typeof openingHours !== 'string' || openingHours.trim().length > 100) {
        return res.status(400).json({ message: 'Opening hours must be a string of max 100 characters' });
      }
    }
    
    // Phone validation (if provided)
    if (phone !== undefined && phone !== null && phone !== '') {
      if (typeof phone !== 'string' || !/^[0-9\s\-\+\(\)]{10,15}$/.test(phone.trim())) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
    }
    
    // Email validation (if provided)
    if (email !== undefined && email !== null && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
    }
    
    // URL validation for social media and maps (if provided)
    const urlRegex = /^https?:\/\/.+/i;
    
    if (googleMapsUrl !== undefined && googleMapsUrl !== null && googleMapsUrl !== '') {
      if (typeof googleMapsUrl !== 'string' || !urlRegex.test(googleMapsUrl.trim())) {
        return res.status(400).json({ message: 'Google Maps URL must be a valid URL' });
      }
    }
    
    if (socialMedia !== undefined) {
      if (socialMedia.instagram !== undefined && socialMedia.instagram !== null && socialMedia.instagram !== '') {
        if (typeof socialMedia.instagram !== 'string' || !urlRegex.test(socialMedia.instagram.trim())) {
          return res.status(400).json({ message: 'Instagram URL must be a valid URL' });
        }
      }
      if (socialMedia.facebook !== undefined && socialMedia.facebook !== null && socialMedia.facebook !== '') {
        if (typeof socialMedia.facebook !== 'string' || !urlRegex.test(socialMedia.facebook.trim())) {
          return res.status(400).json({ message: 'Facebook URL must be a valid URL' });
        }
      }
      if (socialMedia.twitter !== undefined && socialMedia.twitter !== null && socialMedia.twitter !== '') {
        if (typeof socialMedia.twitter !== 'string' || !urlRegex.test(socialMedia.twitter.trim())) {
          return res.status(400).json({ message: 'Twitter URL must be a valid URL' });
        }
      }
    }
    
    // Address validation (if provided)
    if (address !== undefined) {
      if (address.street !== undefined && address.street !== null && address.street !== '') {
        if (typeof address.street !== 'string' || address.street.trim().length > 200) {
          return res.status(400).json({ message: 'Street must be a string of max 200 characters' });
        }
      }
      if (address.area !== undefined && address.area !== null && address.area !== '') {
        if (typeof address.area !== 'string' || address.area.trim().length > 100) {
          return res.status(400).json({ message: 'Area must be a string of max 100 characters' });
        }
      }
      if (address.city !== undefined && address.city !== null && address.city !== '') {
        if (typeof address.city !== 'string' || address.city.trim().length > 100) {
          return res.status(400).json({ message: 'City must be a string of max 100 characters' });
        }
      }
      if (address.state !== undefined && address.state !== null && address.state !== '') {
        if (typeof address.state !== 'string' || address.state.trim().length > 100) {
          return res.status(400).json({ message: 'State must be a string of max 100 characters' });
        }
      }
      if (address.zipCode !== undefined && address.zipCode !== null && address.zipCode !== '') {
        if (typeof address.zipCode !== 'string' || address.zipCode.trim().length > 20) {
          return res.status(400).json({ message: 'Zip code must be a string of max 20 characters' });
        }
      }
      if (address.fullAddress !== undefined && address.fullAddress !== null && address.fullAddress !== '') {
        if (typeof address.fullAddress !== 'string' || address.fullAddress.trim().length < 5 || address.fullAddress.trim().length > 500) {
          return res.status(400).json({ message: 'Full address must be between 5 and 500 characters' });
        }
      }
    }
    
    // Services validation (if provided)
    if (services !== undefined) {
      if (!Array.isArray(services)) {
        return res.status(400).json({ message: 'Services must be an array' });
      }
      const validServices = ['Dine-in', 'Takeaway', 'Delivery'];
      const invalidServices = services.filter(s => !validServices.includes(s));
      if (invalidServices.length > 0) {
        return res.status(400).json({ message: 'Invalid service values. Allowed: Dine-in, Takeaway, Delivery' });
      }
    }
    
    let restaurant = await Restaurant.findOne();

    // Build update object with only allowed fields (used for both create and update)
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (nameHindi !== undefined) updateData.nameHindi = nameHindi.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (priceRange !== undefined) updateData.priceRange = priceRange.trim();
    if (openingHours !== undefined) updateData.openingHours = openingHours.trim();
    if (services !== undefined) updateData.services = services;
    if (socialMedia !== undefined) updateData.socialMedia = socialMedia;
    if (googleMapsUrl !== undefined) updateData.googleMapsUrl = googleMapsUrl.trim();

    // rating and reviewCount are read-only — never set from request body
    // (omitted from updateData entirely; no delete needed)

    if (!restaurant) {
      restaurant = await Restaurant.create(updateData);
    } else {
      Object.assign(restaurant, updateData);
      await restaurant.save();
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({
      message: 'Invalid restaurant data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = {
  getRestaurantInfo,
  updateRestaurantInfo
};
