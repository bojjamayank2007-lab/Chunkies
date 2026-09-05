const mongoose = require('mongoose');

// Counter collection for atomic order ID generation
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sequence: { type: Number, required: true }
});

const Counter = mongoose.model('Counter', CounterSchema);

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
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
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
      min: 1,
      max: 50,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number'
      }
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
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    default: 'COD'
  },
  paymentId: String,
  razorpayOrderId: String,
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate order ID before validation using atomic counter
orderSchema.pre('validate', async function (next) {
  if (!this.orderId) {
    try {
      // Always get the current max order number to ensure counter is correct
      const lastOrder = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
      const lastSequence = lastOrder ? parseInt(lastOrder.orderId.replace('ORD', '')) || 0 : 0;

      // Set counter to current max if it's behind, or increment if it's ahead
      const sequence = await Counter.findOneAndUpdate(
        { name: 'orderId' },
        { $max: { sequence: lastSequence } },
        { new: true, upsert: true }
      );

      // Now increment to get the next unique ID
      const nextSequence = await Counter.findOneAndUpdate(
        { name: 'orderId' },
        { $inc: { sequence: 1 } },
        { new: true }
      );

      this.orderId = `ORD${String(nextSequence.sequence).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
