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
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex-center w-full">
      <div className="glassmorphism border-4 border-primary-lightest rounded-lg w-full max-w-xl p-10">
        <form
          className="flex flex-col flex-center gap-6 h-full"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl text-primary-lightest font-bold mb-2">
            REGISTER
          </h1>

          <input
            type="text"
            name="username"
            className="w-full p-3 rounded form_input text-lg"
            placeholder="Username"
            required
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type="email"
            name="email"
            className="w-full p-3 rounded form_input text-lg"
            placeholder="E-mail"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            name="password"
            className="w-full p-3 rounded form_input text-lg"
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && (
            <div className="w-fit bg-red-600 text-primary-lightest py-2 px-4 rounded-md mt-2 text-lg">
              {error}
            </div>
          )}

          <Link
            href="/auth/login"
            className="font-bold text-primary-lightest hover:scale-105 hover:underline transition-all duration-150 text-lg mt-2"
          >
            Already have an account?
          </Link>

          <button
            className="sign-btn bg-primary-medium hover:bg-primary-dark w-full py-4 disabled:opacity-70 font-bold mt-2 rounded-lg"
            disabled={loading}
          >
            {loading ? <div className="loading  mx-auto"></div> : "REGISTER"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
