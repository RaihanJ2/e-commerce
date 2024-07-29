import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
