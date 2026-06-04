import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number or zero'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true,
    },
    stockCount: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock count cannot be negative'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      index: true, // index category for faster filtering
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
