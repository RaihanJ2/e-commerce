import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const createTransaction = async (
  orderId,
  grossAmount,
  customerDetails,
  items,
  shippingAddress // New parameter for shipping address
) => {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      name: customerDetails.name,
      email: customerDetails.email,
      phone: shippingAddress.phoneNo, // Add phone number
    },
    item_details: items.map((item) => ({
      id: item.productId.toString(),
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return transaction;
  } catch (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }
};
