import { Router } from "express";
import mongoose from "mongoose";
import Envelope from "../models/Envelope.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);
router.get("/", async (req, res) => {
  try {
    res.json(
      await Envelope.find({ userId: req.userId }).sort({ createdAt: 1 }),
    );
  } catch {
    res.status(500).json({ error: "Failed to load envelopes." });
  }
});
router.post("/", async (req, res) => {
  try {
    const { category, group, subtitle, limit, rollover, currency } =
      req.body ?? {};
    if (!["USD", "LKR"].includes(currency))
      return res
        .status(400)
        .json({ error: "Select USD or LKR for the envelope." });
    const created = await Envelope.create({
      userId: req.userId,
      category,
      group,
      subtitle,
      limit,
      rollover,
      currency,
    });
    res.status(201).json(created);
  } catch (e) {
    res
      .status(e.code === 11000 ? 409 : 400)
      .json({
        error:
          e.code === 11000
            ? "An envelope for this category already exists."
            : e.message,
      });
  }
});
router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ error: "Invalid envelope ID." });
  const body = req.body ?? {};
  const allowed = [
    "category",
    "group",
    "subtitle",
    "limit",
    "rollover",
    "currency",
  ];
  if (
    !Object.keys(body).length ||
    Object.keys(body).some((k) => !allowed.includes(k))
  )
    return res.status(400).json({ error: "Invalid update." });
  try {
    const existing = await Envelope.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!existing)
      return res.status(404).json({ error: "Envelope not found." });
    if (
      Object.hasOwn(body, "currency") &&
      existing.currency &&
      existing.currency !== body.currency
    )
      return res
        .status(409)
        .json({
          error:
            "Cannot change envelope currency. Create a separate envelope instead.",
        });
    if (
      Object.hasOwn(body, "currency") &&
      !["USD", "LKR"].includes(body.currency)
    )
      return res.status(400).json({ error: "Invalid currency." });
    // For unclassified legacy envelope, permit one-time currency classification.
    const updated = await Envelope.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: body },
      { returnDocument: "after", runValidators: true },
    );
    res.json(updated);
  } catch (e) {
    res.status(e.code === 11000 ? 409 : 400).json({ error: e.message });
  }
});
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ error: "Invalid envelope ID." });
  try {
    const deleted = await Envelope.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted) return res.status(404).json({ error: "Envelope not found." });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Could not delete envelope." });
  }
});
export default router;
