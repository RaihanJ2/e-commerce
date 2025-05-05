import User from "@models/user";
import { connectDB } from "@utils/db";
import bcrypt from "bcryptjs";

export const POST = async (req) => {
  try {
    await connectDB();

    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return new Response(
        JSON.stringify({ error: "All fields are required." }),
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (user) {
      return new Response(JSON.stringify({ error: "Email already exists." }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
      { status: 500 }
    );
  }
};
