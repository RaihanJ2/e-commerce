import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
