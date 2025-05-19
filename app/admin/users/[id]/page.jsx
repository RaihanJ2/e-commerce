"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Loading from "@app/loading";
import { FaTrashAlt } from "react-icons/fa";

const EditUserPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "user",
  });

  // Available roles
  const roles = ["user", "admin"];

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchUser();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/users/${userId}`);
      setFormData({
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      });
      setError("");
    } catch (err) {
      setError(
        "Failed to load user: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username || !formData.email || !formData.role) {
      setError("All required fields must be filled");
      return;
    }

    try {
      await axios.put(`/api/admin/users/${userId}`, formData);
      setSuccess("User updated successfully!");
      window.scrollTo(0, 0);
    } catch (err) {
      setError(
        "Failed to update user: " + (err.response?.data?.message || err.message)
      );
      window.scrollTo(0, 0);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      router.push("/admin/users");
    } catch (err) {
      setError(
        "Failed to delete user: " + (err.response?.data?.message || err.message)
      );
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-lightest">
          Edit User
        </h1>
        <button
          onClick={() => router.push("/admin/users")}
          className="bg-primary-medium/80 hover:bg-primary-medium text-white font-medium px-5 py-2.5 rounded-lg transition duration-200 shadow-sm"
        >
          Back to Users
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex items-center">
            <span className="font-medium">Error:</span>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex items-center">
            <span className="font-medium">Success:</span>
            <span className="ml-2">{success}</span>
          </div>
        </div>
      )}

      <div className="bg-primary-darkest shadow-md rounded-lg overflow-hidden border border-primary-light p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-primary-lightest text-sm font-medium mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-primary-lightest text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-primary-lightest text-sm font-medium mb-2">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
              required
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-sm flex items-center gap-2"
            >
              <FaTrashAlt /> Delete User
            </button>
            <button
              type="submit"
              className="bg-primary-medium hover:bg-primary-light text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-sm"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;
