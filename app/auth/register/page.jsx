"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/auth/register", form);
      if (res.status === 201) {
        router.push("/auth/login");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
    }
  };

  return (
    <div className=" h-screen flex-center w-full">
      <div className="border-white rounded-lg border-4 w-1/2 h-1/2">
        <form
          className="flex flex-col justify-center items-center gap-2 h-full"
          onSubmit={handleSubmit}
        >
          <h1 className="text-white text-2xl font-bold">REGISTER</h1>
          <input
            type="text"
            name="username"
            className="w-1/2 p-1 rounded"
            placeholder="Username"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="email"
            name="email"
            className="w-1/2 p-1 rounded"
            placeholder="E-mail"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            name="password"
            className="w-1/2 p-1 rounded"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && (
            <div className="w-fit bg-red-600 text-white py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
          <Link
            href="/auth/login"
            className="font-bold text-white hover:scale-105 hover:underline transition-all duration-150 p-1"
          >
            Already have an account?
          </Link>
          <button className="font-bold border-white text-white hover:scale-105 px-5 py-2 rounded border transition-all duration-200 ">
            REGISTER
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
