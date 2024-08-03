"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa6";

const Page = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
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
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    await signIn("google", { callbackUrl: "/" });
  };
  return (
    <div className=" h-screen flex-center w-full">
      <div className="border-white rounded-lg border-4 w-1/2 h-1/2">
        <form
          action=""
          className="flex flex-col justify-center items-center gap-2 h-full "
          onSubmit={handleEmailPasswordLogin}
        >
          <h1 className="text-2xl text-white font-bold">LOGIN</h1>
          <input
            type="email"
            className="w-1/2 p-1 rounded"
            placeholder="E-mail"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-1/2 p-1 rounded"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div className="w-fit bg-red-600 text-white py-1 px-3 rounded-md mt-2 ">
              {error}
            </div>
          )}
          <Link
            href="/auth/register"
            className="font-bold text-white hover:scale-105 hover:underline transition-all duration-150 p-1"
          >
            Register?
          </Link>
          <button
            className="
          font-bold  text-white px-5 py-2 rounded hover:scale-105 border transition-all duration-200 "
          >
            LOGIN
          </button>
          <button
            onClick={handleGoogleSignIn}
            className="font-bold bg-white flex flex-center flex-row text-main px-5 py-2 rounded mt-4  hover:scale-105 border transition-all duration-200"
          >
            <FaGoogle /> &nbsp; Login with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
