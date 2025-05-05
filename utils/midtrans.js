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
  ppnAmount = 0
) => {
  if (!orderId || !grossAmount || !customerDetails || !items) {
    throw new Error("Missing required parameters for transaction creation");
  }

  const itemDetails = [
    ...items.map((item) => ({
      id: item.productId.toString(),
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
  ];

  if (ppnAmount > 0) {
    itemDetails.push({
      id: "PPN",
      price: ppnAmount,
      quantity: 1,
      name: "PPN (5%)",
    });
  }

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      name: customerDetails.name,
      email: customerDetails.email,
      phone: customerDetails.phoneNo || "",
    },
    item_details: itemDetails,
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return transaction;
  } catch (error) {
    console.error("Midtrans transaction creation error:", error);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }
};
