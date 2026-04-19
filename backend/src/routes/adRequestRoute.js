const express = require("express");
const router = express.Router();
const {
  createAdRequest,
  getAllAdRequests,
  getAdRequestById,
  updateAdRequestStatus,
} = require("../controllers/adRequestController.js");

router.post("/",    createAdRequest);
router.get("/",     getAllAdRequests);
router.get("/:id",  getAdRequestById);
router.patch("/:id", updateAdRequestStatus);

module.exports = router;