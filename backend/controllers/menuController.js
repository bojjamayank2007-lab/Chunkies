const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    let query = { isAvailable: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let menuItems = await MenuItem.find(query);
    
    if (sort === 'price-low') {
      menuItems.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      menuItems.sort((a, b) => b.price - a.price);
    } else if (sort === 'popularity') {
      menuItems.sort((a, b) => b.popularity - a.popularity);
    }
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin only
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, isVeg, isFeatured, isAvailable } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const validCategories = ['Burgers', 'Chicken', 'Wraps', 'Sides', 'Combos', 'Drinks'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const menuItem = await MenuItem.create({
      name: name.trim(),
      description: description.trim(),
      price,
      category,
      image: image || '',
      isVeg: isVeg || false,
      isFeatured: isFeatured || false,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({
      message: 'Invalid menu item data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin only
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const { name, description, price, category, image, isVeg, isFeatured, isAvailable } = req.body;

    // Validation for provided fields
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    if (description !== undefined && description.trim() === '') {
      return res.status(400).json({ message: 'Description cannot be empty' });
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (category !== undefined) {
      const validCategories = ['Burgers', 'Chicken', 'Wraps', 'Sides', 'Combos', 'Drinks'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Update only provided fields
    if (name !== undefined) menuItem.name = name.trim();
    if (description !== undefined) menuItem.description = description.trim();
    if (price !== undefined) menuItem.price = price;
    if (category !== undefined) menuItem.category = category;
    if (image !== undefined) menuItem.image = image;
    if (isVeg !== undefined) menuItem.isVeg = isVeg;
    if (isFeatured !== undefined) menuItem.isFeatured = isFeatured;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    await menuItem.save();
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({
      message: 'Invalid menu item data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin only
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    await menuItem.deleteOne();
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
