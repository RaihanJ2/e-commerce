import { NextResponse } from "next/server";
import { connectDB } from "@utils/db";
import Product from "@models/product";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/route";

async function sessionId() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return false;
  }
  return true;
}

export async function GET(req) {
  try {
    if (!(await sessionId())) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    if (!(await sessionId())) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await req.json();

    if (
      !data.name ||
      !data.price ||
      !data.images ||
      !data.description ||
      !data.size ||
      data.size.length === 0
    ) {
      return NextResponse.json(
        { message: "Name, price, images, description, and sizes are required" },
        { status: 400 }
      );
    }

    if (typeof data.price === "string") {
      data.price = parseFloat(data.price);
    }

    const product = new Product({
      name: data.name,
      price: data.price,
      category: data.category || "Clothes",
      images: data.images,
      description: data.description,
      size: data.size,
    });

    const savedProduct = await product.save();

    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}
