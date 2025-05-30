"use client";
import Loading from "@app/loading";
import { formatDate, formatPrice, getImageUrl } from "@utils/utils";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image"; // Import the Image component

const OrderDetails = ({ params }) => {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/order/${id}`);
        setOrder(res.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError(
          error.response?.data?.error || "Failed to fetch order details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistory();
    }
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/order"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to Orders
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/order"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to Orders
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center">No order found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/order"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Back to Orders
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Order Details
          </h1>
          <div className="mt-2 flex flex-wrap gap-y-2">
            <div className="w-full sm:w-1/2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order ID:
              </p>
              <p className="text-gray-900 dark:text-gray-100">{order._id}</p>
            </div>
            <div className="w-full sm:w-1/2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order Date:
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4"
              >
                <div className="flex flex-row gap-4">
                  {item.productImage && (
                    <div className="w-16 h-16 flex-shrink-0">
                      <Image
                        src={`${getImageUrl(item.productImage)}`}
                        alt={item.productName || "Product"}
                        width={64}
                        height={64}
                        className="rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.productName || "Unknown Product"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {item.productId}
                    </p>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">
                        |
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Price: {formatPrice(item.price.toFixed(2))}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(item.totalAmount.toFixed(2))}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Amount:
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(order.totalAmount.toFixed(2))}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Shipping Address
          </h2>
          {order.address ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Name:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {order.address.addressName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phone:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {order.address.phoneNo}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Street:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {order.address.street}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    City:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {order.address.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    State:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {order.address.state}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Postal Code:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {order.address.postalCode}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-500 dark:text-gray-400">
                {order.addressId
                  ? "Address details not available"
                  : "No shipping address information available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
