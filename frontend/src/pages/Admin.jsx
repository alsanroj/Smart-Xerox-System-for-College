import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    billNumber: "",
    name: "",
    email: "",
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) navigate("/admin-login");
  }, [token, navigate]);

  /* =========================
     🔄 Fetch Orders (with filters)
  ========================== */
  const fetchOrders = async (activeFilters = filters) => {
    try {
      setLoading(true);

      // Empty values filter panni params build pannrom
      const params = {};
      Object.entries(activeFilters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });

      const res = await API.get("/orders/history", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin-login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh — filter active illa-na mattum
  useEffect(() => {
    if (!token) return;

    fetchOrders();

    const hasFilter = Object.values(filters).some((v) => v);

    if (!hasFilter) {
      const interval = setInterval(() => fetchOrders(), 5000);
      return () => clearInterval(interval);
    }
  }, [token, filters]); 

  
  /* =========================
     🔍 Filter Handlers
  ========================== */
  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = () => fetchOrders(filters);

  const handleReset = () => {
    const cleared = {
      billNumber: "",
      name: "",
      email: "",
      startDate: "",
      endDate: "",
    };
    setFilters(cleared);
    fetchOrders(cleared);
  };

  /* =========================
     🔁 Update Status
  ========================== */
  const updateStatus = async (id, status) => {
    try {
      await API.put(
        `/orders/status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  /* =========================
     📄 View & Print
  ========================== */
  const viewAndPrint = (id) => {
    const url = `${import.meta.env.VITE_API_URL}/orders/file/${id}?token=${token}`;
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  /* =========================
     🧾 Download Receipt
  ========================== */
  const downloadReceipt = (id) => {
    const url = `${import.meta.env.VITE_API_URL}/orders/receipt/${id}`;
    window.open(url, "_blank");
  };

  /* =========================
     🧹 Logout
  ========================== */
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const getCopiesColor = (amount) => {
    if (amount < 10) return "text-black";
    if (amount <= 50) return "text-green-700";
    if (amount <= 200) return "text-blue-700";
    return "text-red-700";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Admin Panel – Xerox Orders</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-sm-center border-0 font-bold text-white px-4 py-2 rounded-full hover:bg-white hover:text-red-700 hover:border-2 border-red-700 hover:cursor-pointer transition duration-300 "
        >
          Logout
        </button>
      </div>

      {/* 🔍 Filter Section */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="flex items-center gap-2 text-md font-semibold text-gray-700 mb-3">
          <Search className="w-5 h-5" />
          Filter Orders
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text"
            name="billNumber"
            placeholder="Bill Number"
            value={filters.billNumber}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={filters.name}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={filters.email}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="bg-red-600 text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-red-700 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Order Count */}
      <p className="text-sm text-gray-500 mb-3">
        {orders.length} order(s) found
      </p>

      {loading && (
        <p className="text-center text-gray-500 mb-4">Loading orders…</p>
      )}

      {/* Orders Grid */}
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
              <span className="text-xs text-gray-500 font-bold">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-sm font-bold text-gray-600">{order.email}</p>

            <div className="mt-2 text-sm space-y-1">
              <p>
                Pages: <b>{order.selectedPages}</b> | Copies:{" "}
                <b>{order.copies}</b>
              </p>
              <p>
                Type: <b>{order.xeroxType}</b>
              </p>
              <p>
                Amount:{" "}
                <b className={`${getCopiesColor(order.amount)} font-bold`}>
                  ₹{order.amount}
                </b>
              </p>
              <p>
                Bill No: <b>{order.billNumber}</b>
              </p>
            </div>

            <div className="mt-3 absolute right-5 top-10">
              <span
                className={`inline-block px-3 py-1 cursor-not-allowed rounded-full text-sm font-bold
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

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => updateStatus(order._id, "Pending")}
                className="px-3 py-1 rounded bg-yellow-400 
               hover:bg-yellow-500 hover:scale-105
               transition duration-200 
               cursor-pointer font-semibold text-black text-sm"
              >
                Pending
              </button>

              <button
                onClick={() => updateStatus(order._id, "Printing")}
                className="px-3 py-1 rounded bg-blue-500 
               hover:bg-blue-600 hover:scale-105
               transition duration-200 
               cursor-pointer font-semibold text-white text-sm"
              >
                Printing
              </button>

              <button
                onClick={() => updateStatus(order._id, "Ready")}
                className="px-3 py-1 rounded bg-green-600 
               hover:bg-green-700 hover:scale-105
               transition duration-200 
               cursor-pointer font-semibold text-white text-sm"
              >
                Ready
              </button>

              <button
                onClick={() => viewAndPrint(order._id)}
                className="px-3 py-1 rounded bg-gray-900 
               hover:bg-black hover:scale-105
               transition duration-200 
               cursor-pointer font-semibold text-white text-sm"
              >
                View & Print
              </button>
            </div>

            <div className="mt-3">
              <button
                onClick={() => downloadReceipt(order._id)}
                className="text-blue-600 text-sm font-semibold cursor-pointer"
              >
                Download Receipt
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
