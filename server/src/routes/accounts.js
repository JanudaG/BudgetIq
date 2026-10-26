import { Router } from "express";
import mongoose from "mongoose";
import Account from "../models/Account.js";
import { requireAuth } from "../middleware/auth.js";
import Transaction from "../models/Transaction.js";

const router = Router();

// Every account endpoint requires a logged-in user.
router.use(requireAuth);

// GET /api/accounts
// Return only the accounts owned by the current user.
router.get("/", async (req, res) => {
  try {
    const accounts = await Account.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(accounts);
  } catch {
    res.status(500).json({
      error: "Failed to load accounts.",
    });
  }
});

// POST /api/accounts
// Create an account owned by the current user.
router.post("/", async (req, res) => {
  try {
    const { name, type, institution, openingBalance, currency, isLiquid } =
      req.body;

    const created = await Account.create({
      userId: req.userId,
      name,
      type,
      institution,
      openingBalance,
      currency,
      isLiquid,
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      error:
        error.code === 11000
          ? "You already have an account with this name."
          : error.message,
    });
  }
});

// GET /api/accounts/:id
// Return one account, checking ownership.
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid account ID.",
    });
  }

  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({
        error: "Account not found.",
      });
    }

    res.json(account);
  } catch {
    res.status(500).json({
      error: "Failed to load account.",
    });
  }
});

// PATCH /api/accounts/:id
// Update permitted fields on the current user's account.
router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid account ID.",
    });
  }

  const allowedFields = [
    "name",
    "type",
    "institution",
    "openingBalance",
    "currency",
    "isLiquid",
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

  try {
    const updated = await Account.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      { $set: req.body },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updated) {
      return res.status(404).json({
        error: "Account not found.",
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      error:
        error.code === 11000
          ? "You already have an account with this name."
          : error.message,
    });
  }
});

// DELETE /api/accounts/:id
// Delete only an account belonging to the current user.

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid account ID.",
    });
  }

  try {
    // First, verify that the account belongs to this user.
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({
        error: "Account not found.",
      });
    }

    // Check whether any transactions are linked to this account.
    const linkedTransactions = await Transaction.countDocuments({
      userId: req.userId,
      accountId: account._id,
    });

    if (linkedTransactions > 0) {
      return res.status(409).json({
        error: `Cannot delete this account because it has ${linkedTransactions} linked transaction(s). Reassign or delete those transactions first.`,
      });
    }

    // Safe to delete: no transactions reference this account.
    await Account.deleteOne({
      _id: account._id,
      userId: req.userId,
    });

    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete account.",
    });
  }
});

export default router;
