"use client";
import Loading from "@app/loading";
import { formatDate, formatPrice } from "@utils/utils";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/order");
        setOrders(res.data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch orders", error);
        setError(
          error.response?.data?.error ||
            "Failed to load orders. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  if (loading) return <Loading />;

  if (error)
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-lg text-red-500 dark:text-red-400">{error}</div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Order History
        </h3>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                href={`/order/${order._id}`}
                key={order._id}
                className="block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 dark:bg-gray-700 p-4 flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="mb-3 md:mb-0">
                    <div className="flex items-center">
                      <i className="fa-solid fa-bag-shopping text-amber-500 mr-2"></i>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Order placed: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Order ID: {order._id}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {formatPrice(order.totalAmount.toFixed(2))}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="ml-4 text-amber-600 dark:text-amber-400">
                      <i className="fa-solid fa-chevron-right"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
            <div className="inline-block rounded-full bg-gray-100 dark:bg-gray-600 p-3 mb-4">
              <i className="fa-regular fa-clipboard text-gray-500 dark:text-gray-400 text-xl"></i>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't placed any orders yet
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-100 bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
