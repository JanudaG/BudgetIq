import { Router } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All transaction routes require login.
router.use(requireAuth);

// GET: Only the logged-in user's transactions.
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId,
    }).sort({ date: -1, createdAt: -1 });

    res.json(transactions);
  } catch {
    res.status(500).json({ error: "Failed to load transactions." });
  }
});

// POST: Create a transaction belonging to this user.
router.post("/", async (req, res) => {
  try {
    const { name, category, account, type, amount, date } = req.body;

    const created = await Transaction.create({
      name,
      category,
      account,
      type,
      amount,
      date,
      userId: req.userId,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH: Update a transaction belonging to the logged-in user.
router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid transaction ID.",
    });
  }

  try {
    const allowedFields = [
      "name",
      "category",
      "account",
      "type",
      "amount",
      "date",
    ];

    const fields = Object.keys(req.body ?? {});

    if (
      fields.length === 0 ||
      fields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        error: "Invalid or empty update request.",
      });
    }

    const changes = Object.fromEntries(Object.entries(req.body));

    const updated = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      { $set: changes },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updated) {
      return res.status(404).json({
        error: "Transaction not found.",
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});

// DELETE: Only delete a transaction the user owns.
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid transaction ID." });
  }

  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Failed to delete transaction." });
  }
});

export default router;
