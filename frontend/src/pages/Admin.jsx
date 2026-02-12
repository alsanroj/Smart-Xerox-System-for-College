import { useEffect, useState } from "react";
import axios from "axios";
import History from "./History";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/orders/history");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 🔁 Auto refresh every 5 seconds (LIVE ADMIN)
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔁 Update order status
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/status/${id}`, {
        status,
      });
      fetchOrders();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  // 📄 Download uploaded file
  const viewAndPrint = (id) => {
    const token = localStorage.getItem("adminToken");

    const url = `http://localhost:5000/api/orders/file/${id}?token=${token}`;

    const printWindow = window.open(url, "_blank");

    // auto print once loaded
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };



  // 🧾 Download receipt PDF
  const downloadReceipt = (id) => {
    window.open(`http://localhost:5000/api/orders/receipt/${id}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Admin Panel – Xerox Orders
      </h2>

      {loading && (
        <p className="text-center text-gray-500 mb-4">Loading orders…</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white relative p-5 rounded-xl shadow-md"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {order.name.first} {order.name.last}
              </h3>
              <span className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-sm text-gray-600">{order.email}</p>

            <div className="mt-2 text-sm space-y-1">
              <p>
                Pages: <b>{order.selectedPages}</b> | Copies:{" "}
                <b>{order.copies}</b>
              </p>
              <p>
                Type: <b>{order.xeroxType}</b>
              </p>
              <p>
                Amount: <b>₹{order.amount}</b>
              </p>
              <p>
                Bill No: <b>{order.billNumber}</b>
              </p>
            </div>

            <div className="mt-3 absolute right-5 top-10">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-800"
                      : order.status === "Printing"
                        ? "bg-blue-100 text-blue-800 border-2 border-blue-800"
                        : "bg-green-100 text-green-800 border-2 border-green-800"
                  }`}
              >
                {order.status}
              </span>
            </div>

            {/* 🔘 ACTION BUTTONS */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => updateStatus(order._id, "Pending")}
                className="px-3 py-1 rounded bg-yellow-400 text-black text-sm"
              >
                Pending
              </button>

              <button
                onClick={() => updateStatus(order._id, "Printing")}
                className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
              >
                Printing
              </button>

              <button
                onClick={() => updateStatus(order._id, "Ready")}
                className="px-3 py-1 rounded bg-green-600 text-white text-sm"
              >
                Ready
              </button>

              <button
                onClick={() => viewAndPrint(order._id)}
                className="px-3 py-1 rounded bg-gray-900 text-white text-sm"
              >
                View & Print
              </button>
            </div>

            <div className="mt-3">
              <button
                onClick={() => downloadReceipt(order._id)}
                className="text-blue-600 text-sm"
              >
                Download Receipt
              </button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Order History</h2>

        <History />
      </div>
    </div>
  );
};

export default Admin;
