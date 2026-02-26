// src/routes/violation.routes.js
// REST API routes for violations.

const express = require("express");
const violationService = require("../services/violation.service");

const router = express.Router();

// GET /api/violations - all violations
router.get("/", async (req, res, next) => {
  try {
    console.log("[API] GET /api/violations");
    const violations = await violationService.getAllViolations();
    res.json({ success: true, data: violations });
  } catch (err) {
    next(err);
  }
});

// GET /api/violations/unpaid - unpaid violations
router.get("/unpaid", async (req, res, next) => {
  try {
    console.log("[API] GET /api/violations/unpaid");
    const violations = await violationService.getUnpaidViolations();
    res.json({ success: true, data: violations });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/violations/:id/pay - mark violation as paid
router.patch("/:id/pay", async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("[API] PATCH /api/violations/:id/pay", id);

    const updated = await violationService.markViolationPaid(id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Violation not found.",
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

