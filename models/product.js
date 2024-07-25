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
  },
  ratings: {
    type: Number,
  },
});

const Product = models.Product || model("Product", ProductSchema);

export default Product;
