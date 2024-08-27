import { Schema, model, models } from "mongoose";

const predictionSchema = new Schema({
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
  prediction: {
    type: Number,
    required: true,
  },
});

const Prediction = models.Prediction || model("Prediction", predictionSchema);

export default Prediction;
