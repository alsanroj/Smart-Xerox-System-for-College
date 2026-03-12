import { useEffect, useState } from "react";
import API from "../services/api"
import { Copy } from "lucide-react";

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

  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (billNumber, id) => {
    navigator.clipboard.writeText(billNumber);
    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-500 text-center">
        My Xerox Orders
      </h2>

      {orders.length === 0 && (
        <p className="text-center text-red-500">
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
              <p className="font-bold">
                {order.name.first} {order.name.last}
              </p>
              <span className="text-xs text-gray-500 font-semibold">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="font-semibold flex items-center gap-3">
              Bill No:
              <span className="font-normal text-gray-700">
                {order.billNumber}
              </span>
            </p>
            <p className="font-semibold">
              Pages: <span className="font-normal">{order.selectedPages}</span>
            </p>
            <p className="font-semibold">
              Copies: <span className="font-normal">{order.copies}</span>
            </p>
            <p className="font-semibold">
              Amount: <span className="font-normal">₹{order.amount}</span>
            </p>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 cursor-not-allowed rounded-full text-sm font-bold ${getStatusColor(
                  order.status,
                )}`}
              >
                {order.status}
              </span>
            </div>

            <a
              href={`${import.meta.env.VITE_API_URL}/orders/receipt/${order._id}`}
              target="_blank"
              className="text-blue-600 text-sm font-semibold"
            >
              Download Receipt
            </a>
            <button
              onClick={() => handleCopy(order.billNumber, order._id)}
              className="relative left-65 -bottom-0.5 group cursor-pointer p-1 hover:bg-gray-200 rounded transition"
            >
              <Copy className="w-4 h-4 text-gray-600" />

              <span
                className={`absolute -top-8 left-1/2 -translate-x-1/2 
                text-xs px-2 py-1 rounded transition font-bold whitespace-nowrap
                ${
                  copiedId === order._id
                    ? "bg-green-600 text-white opacity-100"
                    : "bg-black text-white opacity-0 group-hover:opacity-100"
                }`}
              >
                {copiedId === order._id
                  ? "Bill Number Copied!"
                  : "Copy Bill Number"}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentHistory;
