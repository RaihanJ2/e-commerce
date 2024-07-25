import Product from "@models/product";
import { connectDB } from "@utils/db";

export const GET = async (req, { params }) => {
  await connectDB();
  const { id } = params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ error: "Cart not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid product ID" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
