"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa6";
import { motion } from "framer-motion";
import Loading from "@app/loading";

const Page = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    await signIn("google", { callbackUrl: "/" });
  };

  const buttonVariants = {
    initial: {
      scale: 1,
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 500,
      },
    },
  };

  return (
    <div className="h-screen flex-center w-full">
      <div className="glassmorphism border-4 border-primary-lightest rounded-lg w-full max-w-xl p-10">
        <form
          className="flex flex-col flex-center gap-6 h-full"
          onSubmit={handleEmailPasswordLogin}
        >
          <h1 className="text-4xl text-primary-lightest font-bold mb-2">
            LOGIN
          </h1>

          <input
            type="email"
            className="w-full p-3 rounded form_input text-lg"
            placeholder="E-mail"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 rounded form_input text-lg"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="w-fit bg-red-600 text-primary-lightest py-2 px-4 rounded-md mt-2 text-lg">
              {error}
            </div>
          )}

          <Link
            href="/auth/register"
            className="font-bold text-primary-lightest hover:scale-105 hover:underline transition-all duration-150 text-lg mt-2"
          >
            Need to register?
          </Link>
          <motion.button
            className="sign-btn bg-primary-medium w-10/12 py-4 disabled:opacity-70 text-xl font-bold mt-2 rounded-lg"
            disabled={loading}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            {loading ? <Loading /> : "LOGIN"}
          </motion.button>

          <motion.button
            disabled={loading}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={handleGoogleSignIn}
            className="font-bold bg-primary-lightest flex-center flex-row text-primary-medium px-6 py-3 rounded-lg mt-4 border text-lg"
            type="button"
          >
            <FaGoogle className="text-xl" /> &nbsp; Login with Google
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Page;
