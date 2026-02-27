import { useEffect, useState } from "react";
import API from "../services/api"

const StudentHistory = () => {
  const [orders, setOrders] = useState([]);
  const studentEmail = localStorage.getItem("studentEmail");

  useEffect(() => {
    if (!studentEmail) return;

    API
      .get(`/orders/student-history/${studentEmail}`)
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch student orders", err);
      });
  }, [studentEmail]);
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-2 border-yellow-800";
      case "Printing":
        return "bg-blue-100 text-blue-800 border-2 border-blue-800";
      case "Ready":
        return "bg-green-100 text-green-800 border-2 border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-2 border-gray-800";
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">My Xerox Orders</h2>

      {orders.length === 0 && (
        <p className="text-center text-gray-500">
          No orders found for this email
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-4 rounded border-2 border-black"
          >
            <div className="flex justify-between items-center ">
              <p className="font-semibold">
                {order.name.first} {order.name.last}
              </p>
              <span className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <p>Bill No: {order.billNumber}</p>
            <p>Pages: {order.selectedPages}</p>
            <p>Copies: {order.copies}</p>
            <p>Amount: ₹{order.amount}</p>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  order.status,
                )}`}
              >
                {order.status}
              </span>
            </div>

            <a
              href={`${import.meta.env.VITE_API_URL}/orders/receipt/${order._id}`}
              target="_blank"
              className="text-blue-600 text-sm"
            >
              Download Receipt
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentHistory;
