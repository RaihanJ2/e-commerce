import Product from "@models/product";
import { connectDB } from "@utils/db";

// Update stock when items are added to cart or purchased
export const PATCH = async (req, { params }) => {
  await connectDB();
  const { id } = params;

  try {
    const { action, quantity } = await req.json();

    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }

    let newStock = product.stock;

    switch (action) {
      case "decrease":
        // Decrease stock (when item is purchased)
        if (product.stock < quantity) {
          return new Response(
            JSON.stringify({ error: "Insufficient stock available" }),
            { status: 400 }
          );
        }
        newStock = product.stock - quantity;
        break;

      case "increase":
        // Increase stock (when item is restocked or order is cancelled)
        newStock = product.stock + quantity;
        break;

      case "set":
        // Set specific stock amount (for admin updates)
        newStock = quantity;
        break;

      default:
        return new Response(
          JSON.stringify({
            error: "Invalid action. Use 'decrease', 'increase', or 'set'",
          }),
          { status: 400 }
        );
    }

    // Ensure stock doesn't go below 0
    newStock = Math.max(0, newStock);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { stock: newStock },
      { new: true }
    );

    return new Response(
      JSON.stringify({
        message: "Stock updated successfully",
        product: updatedProduct,
        previousStock: product.stock,
        newStock: newStock,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating stock:", error);
    return new Response(JSON.stringify({ error: "Failed to update stock" }), {
      status: 500,
    });
  }
};

// Get stock information for a specific product
export const GET = async (req, { params }) => {
  await connectDB();
  const { id } = params;

  try {
    const product = await Product.findById(id).select("stock name");

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        productId: product._id,
        name: product.name,
        stock: product.stock,
        isOutOfStock: product.stock <= 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stock:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch stock information" }),
      { status: 500 }
    );
  }
};
