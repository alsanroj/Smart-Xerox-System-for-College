import { useEffect, useState } from "react";
import axios from "axios";

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/history");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading history...</p>
      </div>
    );
  }

  const statusColor = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-800 border-2 border-yellow-800";
    if (status === "Printing") return "bg-blue-100 text-blue-800 border-2 border-blue-800";
    if (status === "Ready") return "bg-green-100 text-green-800 border-2 border-green-800";
    return "bg-gray-100 text-gray-700";
  };


  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Xerox Order History
      </h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 rounded-xl shadow border"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">Xerox Receipt</h3>
                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>

              <hr className="mb-3" />

              {/* Details */}
              <p>
                <b>Name:</b> {order.name.first} {order.name.last}
              </p>
              <p>
                <b>Email:</b> {order.email}
              </p>

              <p>
                <b>Page Range:</b> {order.pageRange}
              </p>

              <p>
                <b>Selected Pages:</b> {order.selectedPages}
              </p>

              <p>
                <b>Copies:</b> {order.copies}
              </p>

              <p>
                <b>Type:</b>{" "}
                {order.xeroxType === "colour" ? "Colour" : "Normal"}
              </p>

              <hr className="my-3" />

              {/* Footer */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">₹ {order.amount}</span>
                <a
                  href={`http://localhost:5000/api/orders/receipt/${order._id}`}
                  target="_blank"
                  className="text-sm text-blue-600"
                >
                  Download Receipt
                </a>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
