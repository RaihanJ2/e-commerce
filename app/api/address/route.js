import Address from "@models/address";
import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const sessionId = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
};

export const GET = async (req) => {
  await connectDB();
  try {
    const userId = await sessionId();
    const address = await Address.find({ userId });

    return new Response(JSON.stringify(address), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};

export const POST = async (req) => {
  await connectDB();

  try {
    const userId = await sessionId();
    const { addressName, street, city, state, phoneNo, postalCode } =
      await req.json();

    const newAddress = new Address({
      userId,
      addressName,
      street,
      city,
      state,
      phoneNo,
      postalCode,
    });

    await newAddress.save();

    return new Response(JSON.stringify(newAddress), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error saving address" }), {
      status: 400,
    });
  }
};
