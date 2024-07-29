import { Schema, model, models } from "mongoose";

const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      name: {
        type: String,
        required: true,
      },
      size: {
        type: [String],
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      images: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  createAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: { type: Date, default: Date.now },
});

const Cart = models.Cart || model("Cart", CartSchema);

export default Cart;
