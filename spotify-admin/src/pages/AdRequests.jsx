import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const url = "http://localhost:4000";

const STATUS_STYLES = {
  pending:  "bg-yellow-100 text-yellow-800 border-yellow-300",
  accepted: "bg-green-100  text-green-800  border-green-300",
  rejected: "bg-red-100    text-red-800    border-red-300",
};

const AdRequests = () => {
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");
  const [selected, setSelected]         = useState(null); // for modal
  const [adminNote, setAdminNote]       = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const query = filter !== "all" ? `?status=${filter}` : "";
      const res = await axios.get(`${url}/api/ad-requests${query}`);
      if (res.data.success) setRequests(res.data.requests);
    } catch {
      toast.error("Failed to load requests.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const openModal = (req) => {
    setSelected(req);
    setAdminNote(req.admin_note || "");
  };

  const closeModal = () => {
    setSelected(null);
    setAdminNote("");
  };

  const handleAction = async (status) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(`${url}/api/ad-requests/${selected._id}`, {
        status,
        admin_note: adminNote,
      });
      if (res.data.success) {
        toast.success(`Request ${status} successfully.`);
        closeModal();
        fetchRequests();
      }
    } catch {
      toast.error("Action failed. Try again.");
    }
    setActionLoading(false);
  };

  const fmt = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ad Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and manage incoming ad brief requests.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {["all", "pending", "accepted", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition ${
                filter === s
                  ? "bg-[#003A10] text-white border-[#003A10]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-[#003A10]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No {filter !== "all" ? filter : ""} requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#003A10] text-white text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr
                  key={r._id}
                  className="border-t border-gray-100 hover:bg-[#F3FFF7] transition"
                >
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.client_name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.brand_name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.product}</td>
                  <td className="px-4 py-3 text-gray-600">{r.platform}</td>
                  <td className="px-4 py-3 text-gray-600">{r.budget}</td>
                  <td className="px-4 py-3 text-gray-600">{r.deadline}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border capitalize font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openModal(r)}
                      className="text-xs px-3 py-1 rounded-full bg-[#003A10] text-white hover:bg-green-800 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Request Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">Submitted {fmt(selected.createdAt)}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Status badge */}
              <span className={`inline-block px-3 py-1 rounded-full text-xs border capitalize font-medium ${STATUS_STYLES[selected.status]}`}>
                {selected.status}
              </span>

              {/* Client info */}
              <Section title="👤 Client Details">
                <Row label="Name"          value={selected.client_name} />
                <Row label="Brand"         value={selected.brand_name} />
                <Row label="Business Type" value={selected.business_type} />
                <Row label="Email"         value={selected.email} />
                <Row label="Phone"         value={selected.phone} />
                <Row label="WhatsApp"      value={selected.whatsapp || selected.phone} />
                <Row label="City"          value={selected.city} />
                <Row label="Website"       value={selected.website || "—"} />
                <Row label="Instagram"     value={selected.instagram_handle || "—"} />
                <Row label="Launch Date"   value={selected.target_launch_date} />
                <Row label="Revisions"     value={selected.revision_rounds} />
                <Row label="Notes"         value={selected.extra_notes || "—"} />
              </Section>

              {/* Ad brief info */}
              <Section title="📦 Ad Brief">
                <Row label="Product"   value={selected.product} />
                <Row label="Audience"  value={selected.target_audience} />
                <Row label="Platform"  value={selected.platform} />
                <Row label="Type"      value={selected.ad_type} />
                <Row label="Duration"  value={selected.duration} />
                <Row label="Deadline"  value={selected.deadline} />
                <Row label="Budget"    value={selected.budget} />
              </Section>

              {/* Generated brief */}
              {selected.generated_brief && (
                <Section title="✨ Generated Brief">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-[#F3FFF7] rounded-lg p-3 border border-green-100">
                    {selected.generated_brief}
                  </p>
                </Section>
              )}

              {/* Admin note */}
              {selected.status === "pending" && (
                <Section title="📝 Admin Note (optional)">
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add a note for your records..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#003A10] resize-none"
                  />
                </Section>
              )}

              {selected.admin_note && selected.status !== "pending" && (
                <Section title="📝 Admin Note">
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selected.admin_note}
                  </p>
                </Section>
              )}
            </div>

            {/* Modal footer — action buttons */}
            {selected.status === "pending" && (
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => handleAction("accepted")}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 rounded-full text-sm transition"
                >
                  {actionLoading ? "Processing..." : "✅ Accept"}
                </button>
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={actionLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2 rounded-full text-sm transition"
                >
                  {actionLoading ? "Processing..." : "❌ Reject"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Small reusable components
const Section = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex gap-2 text-sm">
    <span className="text-gray-400 w-28 shrink-0">{label}</span>
    <span className="text-gray-800 font-medium">{value}</span>
  </div>
);

export default AdRequests;