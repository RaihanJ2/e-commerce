import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

const Address = ({ onSelectAddress }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [address, setAddress] = useState([]);
  const [form, setForm] = useState({
    addressName: "",
    street: "",
    city: "",
    state: "",
    phoneNo: "",
    postalCode: "",
  });

  const fetchAddress = useCallback(async () => {
    try {
      const res = await axios.get("/api/address");
      setAddress(res.data);
    } catch (error) {
      console.error("Failed to fetch address", error);
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/address", form);
      setAddress((prevAddress) => [...prevAddress, res.data]);
      setIsFormVisible(false);

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
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
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

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);
  return (
    <section className="shadow-sm mt-4 p-4 border w-full flex-center flex-col rounded-md border-gray-200">
      <h6 className="text-lg font-semibold p-4">Address</h6>
      <div className="grid md:grid-cols-2 sm:grid-cols-3 grid-cols-2 gap-8 transition-all duration-100 ease-in-out">
        {isFormVisible ? (
          <div className="w-full p-4 border flex flex-col flex-start border-gray-300 rounded-md">
            <h6 className="text-lg font-semibold mb-4">Add New Address</h6>
            <form
              onSubmit={handleSubmit}
              className="gap-2 flex text-black flex-col w-full"
            >
              <div>
                <input
                  type="text"
                  name="addressName"
                  value={form.addressName}
                  onChange={handleInputChange}
                  className="w-full border px-2 border-gray-300 rounded"
                  placeholder="Address Name"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleInputChange}
                  className="w-full border px-2 border-gray-300 rounded"
                  placeholder="Street"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  className="w-full border px-2 border-gray-300 rounded"
                  placeholder="City"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleInputChange}
                  className="w-full border px-2 border-gray-300 rounded"
                  placeholder="State"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="phoneNo"
                  value={form.phoneNo}
                  onChange={handleInputChange}
                  className="w-full border px-2 border-gray-300 rounded"
                  placeholder="Phone Number"
                />
              </div>
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleInputChange}
                className="w-full border px-2 border-gray-300 rounded"
                placeholder="Postal Code"
              />
              <button
                type="submit"
                className="bg-main border p-2 border-white text-white  rounded"
              >
                Save Address
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={handlePlusButtonClick}
            className={`p-2 border-2 text-4xl font-thin flex-center rounded hover:scale-105 duration-75 ${
              selectedAddress === null
                ? "bg-white text-main scale-105"
                : "bg-main text-white "
            }`}
          >
            <FaPlus />
          </button>
        )}

        {address.map((addr) => (
          <button
            key={addr._id}
            onClick={() => handleAddressClick(addr)}
            className={`p-2 border-2 rounded hover:scale-105 duration-75 ${
              selectedAddress === addr
                ? "bg-white text-main scale-105"
                : "bg-main text-white "
            }`}
          >
            <div className="text-left">
              <div className="font-semibold">{addr.addressName}</div>
              <p>{addr.street}</p>
              <p>
                {addr.city}, {addr.state}, {addr.postalCode}
              </p>
              <p>{addr.phoneNo}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Address;
