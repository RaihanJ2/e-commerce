import { Schema, models, model } from "mongoose";

const AddressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressName: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
});

const Address = models.Address || model("Address", AddressSchema);

export default Address;
