"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  orderStatus: string | null;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const query = `*[_type == "order"]{
          _id,
          orderNumber,
          createdAt,
          total,
          items[]{
            productId,
            name,
            quantity,
            price
          },
          orderStatus
        }`;
        const data: Order[] = await client.fetch(query);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === "createdAt") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "total") {
      return a.total - b.total;
    } else if (sortBy === "orderNumber") {
      return a.orderNumber.localeCompare(b.orderNumber);
    }
    return 0;
  });

  const filteredOrders = sortedOrders.filter(
    (order) =>
      (order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (statusFilter === "" || order.orderStatus === statusFilter)
  );

  const deleteOrder = async (orderId: string) => {
    try {
      await client.delete(orderId);
      setOrders(orders.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:ml-64 text-gray-900">
      <motion.h1
        className="text-3xl font-semibold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Orders
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div className="w-full">
          <input
            type="text"
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 shadow-md"
            placeholder="Search by Order Number or Product Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        <motion.div className="w-full">
          <select
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 shadow-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Filter by Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </motion.div>

        <motion.div className="w-full">
          <select
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 shadow-md"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Sort by Created At</option>
            <option value="total">Sort by Total Amount</option>
            <option value="orderNumber">Sort by Order Number</option>
          </select>
        </motion.div>
      </div>

      {loading ? (
        <motion.div className="flex justify-center items-center space-x-2">
          <FaSpinner className="animate-spin text-blue-500" size={30} />
          <p className="text-gray-600">Loading orders...</p>
        </motion.div>
      ) : (
        <motion.div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto text-sm text-gray-800">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total Items</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <motion.tr key={order._id} className="border-b border-gray-300 hover:bg-gray-100 transition-all">
                    <td className="px-4 py-3 text-center">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-center">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center font-semibold text-blue-600">{order.orderStatus || "Unknown"}</td>
                    <td className="px-4 py-3 text-center">{order.items.length}</td>
                    <td className="px-4 py-3 text-center">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => deleteOrder(order._id)} className="text-red-500 hover:text-red-700">
                        <FaTrash />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-3 text-gray-500">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
