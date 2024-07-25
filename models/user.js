import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      match: [
        /^(?=.{8,30}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._' ]+(?<![_.])$/,
        "Username invalid, it should contain 8-30 characters including alphanumeric letters, spaces, apostrophes, and be unique!",
      ],
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    address: {
      type: String,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", UserSchema);

export default User;
