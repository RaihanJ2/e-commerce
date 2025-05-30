"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@utils/utils";

export const AddProductModal = ({
  showModal,
  setShowModal,
  formData,
  setFormData,
  handleSubmit,
}) => {
  const [sizes, setSizes] = useState(formData.size || []);
  const [newSize, setNewSize] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      const updatedSizes = [...sizes, newSize];
      setSizes(updatedSizes);
      setFormData({ ...formData, size: updatedSizes });
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove) => {
    const updatedSizes = sizes.filter((size) => size !== sizeToRemove);
    setSizes(updatedSizes);
    setFormData({ ...formData, size: updatedSizes });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-darkest rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-primary-light flex-shrink-0">
              <h2 className="text-xl font-bold text-primary-lightest">
                Add New Product
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-primary-lightest/80 hover:text-primary-lightest text-2xl font-semibold transition-colors focus:outline-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Price (IDR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                  >
                    <option value="Clothes">Clothes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    name="images"
                    value={formData.images}
                    onChange={handleInputChange}
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.images && (
                    <div className="mt-3">
                      <div className="relative h-32 w-32 rounded-md overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                        <Image
                          src={getImageUrl(formData.images)}
                          alt="Preview"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-product.jpg";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: [e.target.value],
                      })
                    }
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                    placeholder="Product description"
                    rows="3"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Sizes *
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="w-full border border-primary-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                      placeholder="Add size (e.g., S, M, L, XL, XXL, or custom)"
                    />
                    <button
                      type="button"
                      onClick={addSize}
                      className="bg-primary-medium text-white mx-2 px-4 py-2 rounded hover:bg-primary-medium/80 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sizes.map((size, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-primary-lightest px-3 py-1 rounded-full"
                        >
                          <span className="text-sm font-medium mr-2">
                            {size}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No sizes added yet. Add at least one size.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-primary-darkest">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-primary-light rounded-md text-primary-lightest hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-medium text-white rounded-md hover:bg-primary-medium font-medium transition-colors shadow-sm"
                    disabled={sizes.length === 0}
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const EditProductModal = ({
  showModal,
  setShowModal,
  product,
  formData,
  setFormData,
  handleSubmit,
}) => {
  const [sizes, setSizes] = useState(formData.size || []);
  const [newSize, setNewSize] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      const updatedSizes = [...sizes, newSize];
      setSizes(updatedSizes);
      setFormData({ ...formData, size: updatedSizes });
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove) => {
    const updatedSizes = sizes.filter((size) => size !== sizeToRemove);
    setSizes(updatedSizes);
    setFormData({ ...formData, size: updatedSizes });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-primary-lightest text-2xl font-semibold transition-colors focus:outline-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Price (IDR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                  >
                    <option value="Clothes">Clothes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    name="images"
                    value={formData.images}
                    onChange={handleInputChange}
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.images && (
                    <div className="mt-3">
                      <div className="relative h-32 w-32 rounded-md overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                        <Image
                          src={getImageUrl(formData.images)}
                          alt="Preview"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-product.jpg";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: [e.target.value],
                      })
                    }
                    className="w-full border border-primary-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                    placeholder="Product description"
                    rows="3"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-primary-lightest">
                    Sizes *
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="w-full border border-primary-light rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-medium focus:border-primary-medium transition-colors"
                      placeholder="Add size (e.g., S, M, L, XL, XXL, or custom)"
                    />
                    <button
                      type="button"
                      onClick={addSize}
                      className="bg-primary-medium text-white px-4 py-2 rounded-r-md hover:bg-primary-medium/80 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sizes.map((size, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-primary-lightest px-3 py-1 rounded-full"
                        >
                          <span className="text-sm font-medium mr-2">
                            {size}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No sizes added yet. Add at least one size.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-primary-light rounded-md text-primary-lightest hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-medium text-white rounded-md hover:bg-primary-medium font-medium transition-colors shadow-sm"
                    disabled={sizes.length === 0}
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
