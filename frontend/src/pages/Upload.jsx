import { useState } from "react";
import API from "../services/api";
import StudentHistory from "./StudentHistory";
import { FileText } from "lucide-react";

const Upload = () => {
  const [formData, setFormData] = useState({
    first: "",
    last: "",
    email: "",
    pageRange: "",
    selectedPages: 0,
    copies: "",
    xeroxType: "normal",
    amount: 0,
    fullPrint: false,
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  /* =========================
     🔢 Page Range Calculator
  ========================== */
  const calculateSelectedPages = (rangeStr) => {
    if (!rangeStr) return 0;

    let total = 0;
    const parts = rangeStr.split(",");

    for (let part of parts) {
      part = part.trim();
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          total += end - start + 1;
        }
      } else if (!isNaN(Number(part))) {
        total += 1;
      }
    }

    return total;
  };

  /* =========================
     📄 Detect Total Pages
  ========================== */
  const detectTotalPages = async (file) => {
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await API.post("/orders/detect-pages", data);

      return res.data.totalPages;
    } catch {
      alert("Failed to detect pages");
      return 0;
    }
  };

  /* =========================
     🔄 Handle Form Change
  ========================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let updated = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    let selectedPages = 0;

    if (!updated.fullPrint) {
      selectedPages = calculateSelectedPages(updated.pageRange);
    } else {
      selectedPages = updated.selectedPages;
    }

    const copies = Number(updated.copies);
    const price = updated.xeroxType === "colour" ? 5 : 1;

    updated.selectedPages = selectedPages;
    updated.amount =
      selectedPages > 0 && copies > 0 ? selectedPages * copies * price : 0;

    setFormData(updated);
  };

  /* =========================
     📤 File Select
  ========================== */
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (formData.fullPrint && selectedFile) {
      setLoading(true);

      const totalPages = await detectTotalPages(selectedFile);
      const copies = Number(formData.copies);
      const price = formData.xeroxType === "colour" ? 5 : 1;

      setFormData((prev) => ({
        ...prev,
        selectedPages: totalPages,
        amount: totalPages > 0 && copies > 0 ? totalPages * copies * price : 0,
      }));

      setLoading(false);
    }
  };

  /* =========================
     💳 Razorpay Payment
  ========================== */
  const startPayment = async () => {
    try {
      const { data } = await API.post("/orders/create-payment", {
        amount: formData.amount,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        name: "Smart Xerox System",
        description: "Xerox Payment",
        order_id: data.id,

        handler: async function (response) {
          const verify = await API.post("/orders/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verify.data.success) {
            await uploadOrder(response.razorpay_payment_id);
          } else {
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: formData.first + " " + formData.last,
          email: formData.email,
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed");
    }
  };

  /* =========================
     📤 Upload After Payment
  ========================== */
  const uploadOrder = async (paymentId) => {
    try {
      const data = new FormData();

      data.append("file", file);
      data.append("paymentId", paymentId);

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      await API.post("/orders/upload", data);

      localStorage.setItem("studentEmail", formData.email);

      setShowHistory(true);

      setTimeout(() => {
        document
          .getElementById("history-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);

      alert("Payment Successful & Order Placed 🎉");
    } catch (err) {
      alert("Upload failed");
    }
  };

  /* =========================
     🚀 Submit
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    if (formData.amount <= 0) {
      alert("Invalid amount");
      return;
    }

    startPayment();
  };

  /* =========================
     🧾 UI
  ========================== */

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="w-9xl mx-auto space-y-10">
        <div className="w-xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Xerox Upload
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="input"
                name="first"
                placeholder="First Name"
                onChange={handleChange}
              />

              <input
                className="input"
                name="last"
                placeholder="Last Name"
                onChange={handleChange}
              />

              <input
                className="input"
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="fullPrint"
                  checked={formData.fullPrint}
                  onChange={handleChange}
                />
                <label className="font-medium">Print full document</label>
              </div>

              <input
                className="input"
                name="pageRange"
                placeholder="Pages (eg: 3-9,20)"
                disabled={formData.fullPrint}
                onChange={handleChange}
              />

              <div className="p-3 bg-gray-100 rounded">
                Selected Pages: <b>{formData.selectedPages}</b>
              </div>

              <input
                className="input"
                name="copies"
                type="number"
                placeholder="Copies"
                onChange={handleChange}
              />

              <select
                className="input"
                name="xeroxType"
                value={formData.xeroxType}
                onChange={handleChange}
              >
                <option value="normal">Normal (₹1 / page)</option>
                <option value="colour">Colour (₹5 / page)</option>
              </select>

              <div className="p-3 bg-blue-50 rounded font-semibold text-blue-700">
                Amount: ₹ {formData.amount}
              </div>

              <label
                className="flex flex-col items-center justify-center 
  w-full p-6 border-2 border-dashed 
  border-gray-300 rounded-lg 
  cursor-pointer hover:border-blue-500 
  hover:bg-blue-50 transition"
              >
                <FileText className="w-8 h-8 text-blue-600 mb-2" />

                {!file ? (
                  <>
                    <span className="text-gray-700 font-semibold">
                      Click to Upload File
                    </span>

                    <span className="text-sm text-gray-400 mt-1">
                      PDF, DOC, JPG allowed
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-green-600 font-semibold">
                      File Selected ✅
                    </span>

                    <span className="text-sm text-gray-700 mt-1">
                      {file.name}
                    </span>
                  </>
                )}

                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <button
                disabled={loading}
                className={`w-full py-2 rounded text-white ${
                  loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Processing..." : "Pay & Upload"}
              </button>
            </form>
          </div>
        </div>

        {showHistory && (
          <div id="history-section">
            <h3 className="text-xl font-bold mb-4 text-center">
              My Previous Orders
            </h3>

            <StudentHistory />
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
