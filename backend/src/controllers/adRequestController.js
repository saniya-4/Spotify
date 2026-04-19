const AdRequest = require("../models/addRequest.js");
const sendStatusMail = require("../utils/sendStatusMail.js");

const createAdRequest = async (req, res) => {
  try {
    const request = new AdRequest(req.body);
    await request.save();
    res.json({ success: true, message: "Request saved.", id: request._id });
  } catch (err) {
    console.error("AdRequest save error:", err);
    res.status(500).json({ success: false, message: "Failed to save request." });
  }
};

const getAllAdRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await AdRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch requests." });
  }
};

const getAdRequestById = async (req, res) => {
  try {
    const request = await AdRequest.findById(req.params.id);
    if (!request)
      return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch request." });
  }
};

const updateAdRequestStatus = async (req, res) => {
  try {
    const { status, admin_note } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const request = await AdRequest.findByIdAndUpdate(
      req.params.id,
      { status, admin_note: admin_note || "" },
      { new: true }
    );

    if (!request)
      return res.status(404).json({ success: false, message: "Not found." });

    // ✅ Send email non-blocking — won't crash the response if mail fails
    sendStatusMail(request, status, admin_note || "")
      .then(() => console.log(`📧 Status mail sent to ${request.email}`))
      .catch((err) => console.error("❌ Mail send failed:", err));

    res.json({ success: true, request });

  } catch (err) {
    console.error("updateAdRequestStatus error:", err);
    res.status(500).json({ success: false, message: "Failed to update request." });
  }
};

module.exports = {
  createAdRequest,
  getAllAdRequests,
  getAdRequestById,
  updateAdRequestStatus,
};