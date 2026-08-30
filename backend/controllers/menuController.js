const MenuItem = require('../models/MenuItem');

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Public (for demo - should be protected in production)
const createMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid menu item data', error: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Public (for demo - should be protected in production)
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    Object.assign(menuItem, req.body);
    await menuItem.save();
    
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid menu item data', error: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Public (for demo - should be protected in production)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    await menuItem.deleteOne();
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
