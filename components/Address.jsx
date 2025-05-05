import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaPlus, FaHome } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import AddressForm from "./AddressForm";

const Address = ({ onSelectAddress }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [address, setAddress] = useState([]);

  const fetchAddress = useCallback(async () => {
    try {
      const res = await axios.get("/api/address");
      setAddress(res.data);
    } catch (error) {
      console.error("Failed to fetch address", error);
    }
  }, []);

  const handleAddressClick = useCallback(
    (address) => {
      setSelectedAddress(address);
      onSelectAddress(address);
    },
    [onSelectAddress]
  );

  const handlePlusButtonClick = () => {
    setIsFormVisible((prev) => !prev);
  };

  const handleAddressAdded = (newAddress) => {
    setAddress((prevAddress) => [...prevAddress, newAddress]);
    setIsFormVisible(false);
  };

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  return (
    <motion.section
      className="glassmorphism bg-primary-darkest text-primary-lightest"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold mb-4 blue_gradient">
        Shipping Address
      </h2>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="wait">
          {isFormVisible ? (
            <AddressForm
              onCancel={handlePlusButtonClick}
              onAddressAdded={handleAddressAdded}
            />
          ) : (
            <motion.button
              onClick={handlePlusButtonClick}
              className={`glassmorphism hover:scale-105 duration-150 transition-all flex-center flex-col py-4 ${
                address.length === 0 ? "bg-primary-light" : "bg-primary-medium"
              }`}
              key="add-address-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus className="text-4xl mb-2" />
              <span className="font-medium">Add New Address</span>
            </motion.button>
          )}
        </AnimatePresence>

        {address.map((addr, index) => (
          <button
            key={addr._id}
            onClick={() => handleAddressClick(addr)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-150 hover:scale-105 ${
              selectedAddress?._id === addr._id
                ? "border-primary-light bg-primary-light/20 scale-105"
                : "border-primary-dark bg-primary-darkest"
            }`}
          >
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <FaHome
                  className={`text-xl ${
                    selectedAddress?._id === addr._id
                      ? "text-primary-light"
                      : "text-primary-medium"
                  }`}
                />
              </div>
              <div>
                <div className="font-semibold text-lg">{addr.addressName}</div>
                <p className="text-primary-lightest/80">{addr.street}</p>
                <p className="text-primary-lightest/80">
                  {addr.city}, {addr.state}, {addr.postalCode}
                </p>
                <p className="text-primary-lightest/80 mt-1">{addr.phoneNo}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.section>
  );
};

export default Address;
