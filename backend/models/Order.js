const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  orderType: {
    type: String,
    required: true,
    enum: ['Dine-in', 'Takeaway', 'Delivery']
  },
  address: {
    type: String
  },
  tableNumber: {
    type: String
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate order ID before validation
orderSchema.pre('validate', async function(next) {
  if (!this.orderId) {
    const count = await this.constructor.countDocuments();
    this.orderId = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
