import { Schema, model, models } from "mongoose";

const NeighborSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  neighbors: [
    {
      neighborId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      similarity: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Neighbor = models.Neighbor || model("Neighbor", NeighborSchema);

export default Neighbor;
