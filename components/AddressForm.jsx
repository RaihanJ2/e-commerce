import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const AddressForm = ({ onCancel, onAddressAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    addressName: "",
    street: "",
    city: "",
    state: "",
    phoneNo: "",
    postalCode: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/api/address", form);
      onAddressAdded(res.data);

      setForm({
        addressName: "",
        street: "",
        city: "",
        state: "",
        phoneNo: "",
        postalCode: "",
      });
    } catch (error) {
      console.error("Failed to submit address", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <motion.div
      className="glassmorphism bg-primary-medium p-5 col-span-2"
      key="address-form"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h3 className="text-lg font-medium mb-4 text-primary-lightest">
        Add New Address
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            name="addressName"
            value={form.addressName}
            onChange={handleInputChange}
            className="form_input"
            placeholder="Address Name"
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="street"
            value={form.street}
            onChange={handleInputChange}
            className="form_input"
            placeholder="Street"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleInputChange}
            className="form_input"
            placeholder="City"
            required
          />
          <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleInputChange}
            className="form_input"
            placeholder="State"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="tel"
            name="phoneNo"
            value={form.phoneNo}
            onChange={handleInputChange}
            className="form_input"
            placeholder="Phone Number"
            required
          />
          <input
            type="text"
            name="postalCode"
            value={form.postalCode}
            onChange={handleInputChange}
            className="form_input"
            placeholder="Postal Code"
            required
          />
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="outline-btn w-1/2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="sign-btn bg-primary-light hover:bg-primary-medium w-1/2"
          >
            {isLoading ? (
              <div className="loading mx-auto"></div>
            ) : (
              "Save Address"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddressForm;
