import User from "@models/user";
import { connectDB } from "@utils/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        await connectDB();
        const sessionUser = await User.findOne({ email: session.user.email });

        if (sessionUser) {
          // Add user ID to the session object
          session.user.id = sessionUser._id.toString();
        } else {
          // Optional: Handle case where user is not found
          console.warn("User not found in database:", session.user.email);
        }

        return session;
      } catch (error) {
        console.error("Error fetching user:", error);
        return session; // Return session even if an error occurs
      }
    },
    async signIn({ profile }) {
      try {
        await connectDB();
        const userExist = await User.findOne({ email: profile.email });

        if (!userExist) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(/\s+/g, "").toLowerCase(),
            image: profile.image,
          });
        }
        return true;
      } catch (error) {
        console.error("Error signing in:", error);
        return false;
      }
    },
  },
  session: {
    strategy: "jwt", // Ensure you're using JWT strategy
    maxAge: 60 * 60, // Session expiration time (1 hour)
  },
  pages: {
    signIn: "/auth/signin", // Optional: custom sign-in page
    error: "/auth/error", // Optional: custom error page
    verifyRequest: "/auth/verify-request", // Optional: custom verification request page
    newAccount: "/auth/new-account", // Optional: custom new account page
  },
};

const handler = (req, res) => NextAuth(req, res, authOptions);

export { handler as GET, handler as POST };
