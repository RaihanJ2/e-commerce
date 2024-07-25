import axios from "axios";

export const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  })
    .format(price)
    .replace("Rp", "Rp.");
};

export const getCart = async (id) => {
  try {
    const res = await axios.get(`/api/cart?id=${id}`);
    return res.data;
  } catch (error) {
    console.error("Error getting cart:", error);
  }
};

export const addToCart = async (id, product, quantity = 1) => {
  try {
    const res = await axios.post("/api/cart", {
      action: "add",
      id,
      product,
      quantity,
    });
    return res.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};

export const removeCart = async (id, productId) => {
  try {
    const res = await axios.post("/api/cart", {
      action: "remove",
      id,
      productId,
    });
    return res.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
};

export const updateQty = async (id, productId, quantity) => {
  try {
    const res = await axios.post("/api/cart", {
      action: "update",
      id,
      productId,
      quantity,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating cart:", error);
  }
};
