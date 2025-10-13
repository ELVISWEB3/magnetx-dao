"use strict";
const express = require("express");
const router = express.Router();
const storage = require("../storage");

function sanitizeFormName(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 64) || "default";
}

// Create a submission for a given form name.
// Accepts application/json or application/x-www-form-urlencoded (from HTML forms)
router.post("/:formName", async (req, res) => {
  try {
    const formName = sanitizeFormName(req.params.formName);
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const ua = req.get("user-agent") || null;
    const ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim() || null;

    const result = await storage.storeSubmission(formName, payload, ua, ip);

    return res.status(201).json({ id: result.id, form: formName, created_at: result.created_at });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "failed_to_store_submission" });
  }
});

// List known forms
router.get("/", async (req, res) => {
  // Pull distinct forms from the generic table via a small query using storage
  try {
    const submissions = await storage.listSubmissions("apply", 1, 0);
    // This endpoint is simple; for multi-form support, extend storage with a 'listForms' method
    res.json({ forms: submissions.length ? ["apply"] : [] });
  } catch (e) {
    res.json({ forms: [] });
  }
});

// Paginated submissions for a form
router.get("/:formName/submissions", async (req, res) => {
  try {
    const formName = sanitizeFormName(req.params.formName);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);
    const offset = (page - 1) * limit;

    const submissions = await storage.listSubmissions(formName, limit, offset);

    res.json({ page, limit, submissions });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "failed_to_list_submissions" });
  }
});

module.exports = router;
