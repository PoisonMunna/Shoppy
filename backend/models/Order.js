import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required for each order item'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required at the time of order'],
    min: [0, 'Price cannot be negative'],
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for each order'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [
        {
          validator: function (val) {
            return val && val.length > 0;
          },
          message: 'Order must contain at least one item',
        },
      ],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Paid', 'Failed'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'Pending',
    },
    status: {
      type: String,
      enum: {
        values: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'Processing',
    },
    shippingAddress: {
      street: { type: String, required: [true, 'Street address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      postalCode: { type: String, required: [true, 'Postal code is required'] },
      country: { type: String, required: [true, 'Country is required'] },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
