import Product from "@models/product";
import { connectDB } from "@utils/db";

export const GET = async () => {
  try {
    await connectDB();

    const products = await Product.find({});

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response("Failed to fetch all products", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
