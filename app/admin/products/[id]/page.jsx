"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Loading from "@app/loading";
import { FaTrashAlt } from "react-icons/fa";
import { getImageUrl } from "@utils/utils";

const EditProductPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newSizeInput, setNewSizeInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    images: "",
    description: [""],
    size: [],
    stock: "", // Added stock field
  });

  // Available categories and sizes
  const categories = ["Clothes", "Shoes", "Accessories", "Other"];
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchProduct();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/products/${productId}`);
      const product = response.data;

      // Ensure description is an array
      const description = Array.isArray(product.description)
        ? product.description
        : [product.description || ""];

      // Ensure size is an array
      const size = Array.isArray(product.size) ? product.size : [];

      setFormData({
        ...product,
        description,
        size,
        price: product.price.toString(),
        stock: (product.stock || 0).toString(), // Handle stock field
      });

      setError("");
    } catch (err) {
      setError(
        "Failed to load product: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (index, value) => {
    const newDescription = [...formData.description];
    newDescription[index] = value;
    setFormData({ ...formData, description: newDescription });
  };

  const addDescriptionField = () => {
    setFormData({ ...formData, description: [...formData.description, ""] });
  };

  const removeDescriptionField = (index) => {
    if (formData.description.length > 1) {
      const newDescription = formData.description.filter((_, i) => i !== index);
      setFormData({ ...formData, description: newDescription });
    }
  };

  const handleSizeToggle = (size) => {
    const newSizes = formData.size.includes(size)
      ? formData.size.filter((s) => s !== size)
      : [...formData.size, size];
    setFormData({ ...formData, size: newSizes });
  };

  const addCustomSize = () => {
    if (newSizeInput.trim() && !formData.size.includes(newSizeInput.trim())) {
      setFormData({
        ...formData,
        size: [...formData.size, newSizeInput.trim()],
      });
      setNewSizeInput("");
    }
  };

  const removeSize = (sizeToRemove) => {
    setFormData({
      ...formData,
      size: formData.size.filter((size) => size !== sizeToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.price ||
      !formData.images ||
      !formData.description[0] ||
      formData.size.length === 0 ||
      formData.stock === "" // Added stock validation
    ) {
      setError("All required fields must be filled");
      return;
    }

    // Validate stock is a non-negative number
    const stockValue = parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      setError("Stock must be a valid number (0 or greater)");
      return;
    }

    try {
      const submitData = {
        ...formData,
        stock: stockValue, // Convert stock to number
      };

      await axios.put(`/api/admin/products/${productId}`, submitData);
      setSuccess("Product updated successfully!");
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      setError(
        "Failed to update product: " +
          (err.response?.data?.message || err.message)
      );
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-lightest">
          Edit Product
        </h1>
        <button
          onClick={() => router.push("/admin/products")}
          className="bg-primary-medium/80 hover:bg-primary-medium text-white font-medium px-5 py-2.5 rounded-lg transition duration-200 shadow-sm"
        >
          Back to Products
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
          {/* Product Image Preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative h-48 w-48 rounded-md overflow-hidden border border-primary-light bg-white mb-4">
              <Image
                src={getImageUrl(formData.images)}
                alt={formData.name || "Product image"}
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-product.jpg";
                }}
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-primary-lightest text-sm font-medium mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
              required
            />
          </div>

          {/* Price, Category, and Stock in the same row for larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price */}
            <div>
              <label className="block text-primary-lightest text-sm font-medium mb-2">
                Price * (IDR)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-primary-lightest text-sm font-medium mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-primary-lightest text-sm font-medium mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
                required
              />
              {parseInt(formData.stock) === 0 && (
                <p className="text-orange-400 text-xs mt-1">
                  ⚠️ Product will be marked as out of stock
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-primary-lightest text-sm font-medium mb-2">
              Image URL *
            </label>
            <input
              type="text"
              name="images"
              value={formData.images}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
              required
            />
            <p className="text-xs text-primary-light mt-1">
              Enter a URL to an image (e.g., https://example.com/image.jpg)
            </p>
          </div>

          {/* Updated Sizes Section */}
          <div className="mb-4">
            <label className="block text-primary-lightest text-sm font-medium mb-2">
              Sizes *
            </label>

            {/* Custom Size Input */}
            <div className="flex items-center mb-3">
              <input
                type="text"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSize()}
                className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add custom size (e.g., 38, 40, One Size)"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="bg-primary-medium text-white mx-2 px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>

            {/* Selected Sizes Display */}
            {formData.size.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.size.map((size) => (
                  <div
                    key={size}
                    className="flex items-center bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-800 mr-1.5">
                      {size}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-gray-400 hover:text-red-500 text-lg leading-none"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500 text-xs mt-1">
                Please select or add at least one size
              </p>
            )}
          </div>

          {/* Description Fields */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-primary-lightest text-sm font-medium">
                Description *
              </label>
              <button
                type="button"
                onClick={addDescriptionField}
                className="bg-primary-medium/80 hover:bg-primary-medium text-sm text-primary-lightest px-4 py-2 rounded"
              >
                + Add Description Line
              </button>
            </div>
            {formData.description.map((desc, index) => (
              <div key={index} className="flex items-center mb-2 gap-2">
                <textarea
                  value={desc}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-primary-dark text-primary-lightest border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-medium"
                  rows="2"
                  required={index === 0}
                />
                {formData.description.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDescriptionField(index)}
                    className="bg-primary-medium/80 hover:bg-primary-medium text-primary-lightest py-2 px-4 rounded h-[58px] "
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-primary-medium hover:bg-primary-light text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-sm"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
