"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatPrice } from "@utils/utils";

export default function SalesDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all"); // 'all', 'week', 'month', 'year'
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch orders
        const ordersResponse = await axios.get("/api/order");
        setOrders(ordersResponse.data);

        // Fetch products - use your existing endpoint
        const productsResponse = await axios.get("/api/product");

        // Convert products array to a map for easy lookup
        const productsMap = {};
        productsResponse.data.forEach((product) => {
          productsMap[product._id] = product;
        });

        setProducts(productsMap);
        calculateStats(ordersResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load sales data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Recalculate stats when date range changes
    if (orders.length > 0) {
      const filteredOrders = filterOrdersByDateRange(orders, dateRange);
      calculateStats(filteredOrders);
    }
  }, [dateRange, orders]);

  const filterOrdersByDateRange = (orderList, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "week":
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
      default:
        return orderList;
    }

    return orderList.filter((order) => new Date(order.createdAt) >= startDate);
  };

  const calculateStats = (orderList) => {
    // Skip calculation if the list is empty
    if (!orderList || !orderList.length) {
      setStats({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
      });
      return;
    }

    const totalOrders = orderList.length;
    const totalSales = orderList.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const averageOrderValue = totalSales / totalOrders;

    setStats({
      totalSales,
      totalOrders,
      averageOrderValue,
    });
  };

  // Prepare data for product sales chart
  const getProductSalesData = () => {
    if (!orders || !orders.length) return [];

    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    // Aggregate product sales
    const productSales = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId.toString();

        // Get product name or use fallback
        const productName = products[productId]
          ? products[productId].name
          : `Product ${productId.substring(0, 6)}...`;

        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.totalAmount;
      });
    });

    // Convert to array and sort by revenue
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 products
  };

  // Prepare data for daily sales chart
  const getDailySalesData = () => {
    if (!orders || !orders.length) return [];

    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    // Group by date
    const dailySales = {};

    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!dailySales[date]) {
        dailySales[date] = {
          date,
          revenue: 0,
          orders: 0,
        };
      }
      dailySales[date].revenue += order.totalAmount;
      dailySales[date].orders += 1;
    });

    // Convert to array and sort by date
    return Object.values(dailySales).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const productSalesData = getProductSalesData();
  const dailySalesData = getDailySalesData();

  return (
    <div className="container mx-auto px-4 py-8 bg-primary-medium rounded">
      <h1 className="text-3xl font-bold mb-8">Sales Dashboard</h1>

      {/* Date range filter */}
      <div className="mb-6">
        <label
          htmlFor="dateRange"
          className="block text-base font-medium text-gray-100 mb-1"
        >
          Date Range:
        </label>
        <select
          id="dateRange"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-primary-darkest p-2 border text-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Time</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-transparent p-6 rounded-lg shadow-md bg-primary-darkest">
          <h3 className="text-lg font-medium text-gray-100">Total Sales</h3>
          <p className="text-3xl font-bold">{formatPrice(stats.totalSales)}</p>
        </div>

        <div className="bg-transparent p-6 rounded-lg shadow-md bg-primary-darkest">
          <h3 className="text-lg font-medium text-gray-100">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>

        <div className="bg-transparent p-6 rounded-lg shadow-md bg-primary-darkest">
          <h3 className="text-lg font-medium text-gray-100">
            Average Order Value
          </h3>
          <p className="text-3xl font-bold">
            {formatPrice(stats.averageOrderValue)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="">
        {/* Daily Sales Chart */}
        <div className="bg-transparent p-6 rounded-lg shadow-md bg-primary-darkest">
          <h2 className="text-xl font-bold mb-4">Daily Sales</h2>
          {dailySalesData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Rp" fill="#8884d8" />
                  <Bar
                    dataKey="orders"
                    name="Number of Orders"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-100 text-center py-8">
              No sales data available for the selected period.
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 bg-transparent p-6 rounded-lg shadow-md bg-primary-darkest">
        <h2 className="text-xl font-bold mb-4">Top Products by Revenue</h2>
        {productSalesData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productSalesData}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {productSalesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${formatPrice(value)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-100 text-center py-8">
            No product data available for the selected period.
          </p>
        )}
      </div>
      {/* Order Table */}
      <div className="mt-8 bg-transparent p-6 rounded-lg shadow-md bg-primary-darkest">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-gray-200">
                {filterOrdersByDateRange(orders, dateRange)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 10)
                  .map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {order._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {formatPrice(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-100 text-center py-4">No orders available.</p>
        )}
      </div>

      {/* Product Details Table */}
      <div className="mt-8 bg-transparent p-6 rounded-lg shadow-md bg-primary-darkest">
        <h2 className="text-xl font-bold mb-4">Top Product Sales</h2>
        {productSalesData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-gray-200">
                {productSalesData.map((product) => (
                  <tr key={product.productId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {formatPrice(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-100 text-center py-4">
            No product data available.
          </p>
        )}
      </div>
    </div>
  );
}
