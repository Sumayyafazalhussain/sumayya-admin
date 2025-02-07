"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalInventory, setTotalInventory] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [completedOrders, setCompletedOrders] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [deliveredOrders, setDeliveredOrders] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products data
        const productQuery = `*[_type == "shopProduct"]{
          price,
          stockLevel,
          _createdAt
        }`;

        const productsData = await client.fetch(productQuery);
        setTotalProducts(productsData.length);
        setTotalInventory(
          productsData.reduce(
            (acc: number, product: { stockLevel: number }) =>
              acc + product.stockLevel,
            0
          )
        );
        setTotalAmount(
          productsData.reduce(
            (acc: number, product: { price: number; stockLevel: number }) =>
              acc + product.price * product.stockLevel,
            0
          )
        );

        // Fetch orders data
        const ordersQuery = `*[_type == "order"]{
          orderStatus,
          createdAt,
          total
        }`;

        const ordersData = await client.fetch(ordersQuery);
        setTotalOrders(ordersData.length);
        setCompletedOrders(
          ordersData.filter(
            (order: { orderStatus: string }) =>
              order.orderStatus === "completed"
          ).length
        );
        setPendingOrders(
          ordersData.filter(
            (order: { orderStatus: string }) => order.orderStatus === "pending"
          ).length
        );
        setDeliveredOrders(
          ordersData.filter(
            (order: { orderStatus: string }) => order.orderStatus === "shipped"
          ).length
        );

        // Fetch reviews data
        const reviewsQuery = `*[_type == "review"]{ _id }`;
        const reviewsData = await client.fetch(reviewsQuery);
        setTotalReviews(reviewsData.length);

        // Process data for the chart
        const monthlyData = ordersData.reduce(
          (
            acc: { [key: string]: { orders: number; sales: number } },
            order: { createdAt: string; total: number }
          ) => {
            const date = new Date(order.createdAt);
            const month = date.toLocaleString("default", {
              month: "short",
              year: "numeric",
            });
            if (!acc[month]) {
              acc[month] = { orders: 0, sales: 0 };
            }
            acc[month].orders += 1;
            acc[month].sales += order.total;
            return acc;
          },
          {}
        );

        const labels = Object.keys(monthlyData);
        const ordersDataPoints = labels.map(
          (month) => monthlyData[month].orders
        );
        const salesDataPoints = labels.map((month) => monthlyData[month].sales);

        const chartDataFormatted = labels.map((month, index) => ({
          name: month,
          totalOrders: ordersDataPoints[index],
          totalSales: salesDataPoints[index],
        }));

        setChartData(chartDataFormatted);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Variants for animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, type: "spring", stiffness: 75 },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:ml-64">
      {/* Header Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Insights and analytics for your business.
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products Card */}
        <motion.div
          className="bg-white rounded-xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <span className="text-4xl mb-4">📦</span> {/* Custom Icon */}
          <h2 className="text-lg font-semibold text-gray-700">
            Total Products
          </h2>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </motion.div>

        {/* Total Inventory Card */}
        <motion.div
          className="bg-white rounded-xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <span className="text-4xl mb-4">📊</span> {/* Custom Icon */}
          <h2 className="text-lg font-semibold text-gray-700">
            Total Inventory
          </h2>
          <p className="text-2xl font-bold text-gray-900">{totalInventory}</p>
        </motion.div>

        {/* Total Sales Amount Card */}
        <motion.div
          className="bg-white rounded-xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <span className="text-4xl mb-4">💰</span> {/* Custom Icon */}
          <h2 className="text-lg font-semibold text-gray-700">
            Total Sales Amount
          </h2>
          <p className="text-2xl font-bold text-gray-900">
            ${totalAmount.toFixed(2)}
          </p>
        </motion.div>

        {/* Total Orders Card */}
        <motion.div
          className="bg-white rounded-xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <span className="text-4xl mb-4">📦</span> {/* Custom Icon */}
          <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </motion.div>
      </div>

      {/* Reviews and Orders Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reviews Card */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Total Reviews</h2>
            <span className="text-4xl">⭐</span> {/* Custom Icon */}
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
        </motion.div>

        {/* Orders Status Card */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Orders Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">✅</span> {/* Custom Icon */}
                <span className="text-gray-700">Completed</span>
              </div>
              <span className="text-gray-900 font-bold">{completedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⏳</span> {/* Custom Icon */}
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="text-gray-900 font-bold">{pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🚚</span> {/* Custom Icon */}
                <span className="text-gray-700">Delivered</span>
              </div>
              <span className="text-gray-900 font-bold">{deliveredOrders}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-2">📈</span> Sales & Orders Trend
        </h2>
        {loading ? (
          <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalOrders"
                stroke="#3B82F6" // Blue
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#F59E0B" // Amber
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
