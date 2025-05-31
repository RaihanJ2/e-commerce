"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaGear } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import { formatPrice, getImageUrl } from "@utils/utils";
import axios from "axios";
import { AddProductModal } from "@components/ProductFormModals";
import Loading from "@app/loading";

const AdminProductsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Clothes",
    images: "",
    description: [""],
    size: [],
    stock: "", // Added stock field
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchProducts();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      router.push("/");
    }
  }, [status, session]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/products");
      setProducts(response.data);
      setError("");
    } catch (err) {
      setError(
        "Failed to load products: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      await axios.post("/api/admin/products", submitData);
      setShowAddModal(false);
      setFormData({
        name: "",
        price: "",
        category: "Clothes",
        images: "",
        description: [""],
        size: [],
        stock: "", // Reset stock field
      });
      fetchProducts();
      setError("");
    } catch (err) {
      setError(
        "Failed to add product: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await axios.delete(`/api/admin/products/${id}`);
      fetchProducts();
      setError("");
    } catch (err) {
      setError(
        "Failed to delete product: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Helper function to get stock status
  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { text: "Out of Stock", color: "text-red-500" };
    } else {
      return { text: `${stock}`, color: "text-green-500" };
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-lightest mb-4 md:mb-0">
          Products Management
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-medium hover:bg-primary-medium/80 text-white font-medium px-5 py-2.5 rounded-lg transition duration-200 shadow-sm flex items-center"
          >
            <span className="mr-1">+</span> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex items-center">
            <span className="font-medium">Error:</span>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-transparent shadow-md rounded-lg overflow-hidden border border-primary-light">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary-light">
            <thead className="bg-primary-darkest text-primary-lightest">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary-darkest text-primary-lightest divide-y divide-primary-light">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    No products found. Add your first product using the button
                    above.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-primary-dark transition duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border border-primary-light bg-white">
                          <Image
                            src={getImageUrl(product.images)}
                            alt={product.name}
                            fill
                            className="object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-product.jpg";
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(product.price)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-medium ${stockStatus.color}`}
                      >
                        {stockStatus.text}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-around gap-3">
                          <button
                            onClick={() =>
                              router.push(`/admin/products/${product._id}`)
                            }
                            className="bg-primary-medium/80 text-primary-lightest px-4 py-2 rounded hover:bg-primary-medium font-medium transition-colors"
                          >
                            <FaGear />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="bg-red-600 hover:bg-red-800 text-primary-lightest px-4 py-2 rounded font-medium transition-colors"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import and use Add Product Modal */}
      <AddProductModal
        showModal={showAddModal}
        setShowModal={setShowAddModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminProductsPage;
