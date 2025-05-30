import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: [String],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ["Clothes", "Accessories"],
    },
  },
  size: {
    type: [String],
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  avgRatings: {
    type: Number,
  },
});

// Virtual field to check if product is out of stock
ProductSchema.virtual("isOutOfStock").get(function () {
  return this.stock <= 0;
});

// Ensure virtual fields are serialized
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

const Product = models.Product || model("Product", ProductSchema);

export default Product;
