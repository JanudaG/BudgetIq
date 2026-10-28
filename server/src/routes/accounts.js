import { Router } from "express";
import mongoose from "mongoose";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const allowedFields = [
  "name",
  "type",
  "institution",
  "openingBalance",
  "currency",
  "isLiquid",
];

function validFields(body) {
  const keys = Object.keys(body ?? {});
  return keys.length > 0 && keys.every((key) => allowedFields.includes(key));
}

function errorResponse(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      error: "You already have an account with this name.",
    });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ error: error.message });
  }
  console.error("Accounts API error:", error);
  return res.status(500).json({ error: "An account operation failed." });
}

// GET /api/accounts — list this user's accounts.
router.get("/", async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    return res.json(accounts);
  } catch (error) {
    return errorResponse(res, error);
  }
});

// GET /api/accounts/:id — get one of this user's accounts.
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid account ID." });
  }

  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }
    return res.json(account);
  } catch (error) {
    return errorResponse(res, error);
  }
});

// POST /api/accounts — create an account.
router.post("/", async (req, res) => {
  if (!validFields(req.body)) {
    return res.status(400).json({ error: "Invalid or empty account request." });
  }

  try {
    const data = Object.fromEntries(
      allowedFields
        .filter((field) =>
          Object.prototype.hasOwnProperty.call(req.body, field),
        )
        .map((field) => [field, req.body[field]]),
    );

    const created = await Account.create({ ...data, userId: req.userId });
    return res.status(201).json(created);
  } catch (error) {
    return errorResponse(res, error);
  }
});

// PATCH /api/accounts/:id — edit a user-owned account.
router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid account ID." });
  }
  if (!validFields(req.body)) {
    return res.status(400).json({ error: "Invalid or empty update request." });
  }

  try {
    const existingAccount = await Account.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!existingAccount) {
      return res.status(404).json({ error: "Account not found." });
    }

    // An account linked to transactions cannot switch currencies.
    // Changing USD amounts into LKR without conversion would corrupt balances.
    if (
      req.body.currency !== undefined &&
      req.body.currency !== existingAccount.currency
    ) {
      const linkedCount = await Transaction.countDocuments({
        userId: req.userId,
        accountId: existingAccount._id,
      });

      if (linkedCount > 0) {
        return res.status(409).json({
          error:
            "Cannot change account currency while transactions are linked to it.",
        });
      }
    }

    const updated = await Account.findOneAndUpdate(
      { _id: existingAccount._id, userId: req.userId },
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Account not found." });
    }

    return res.json(updated);
  } catch (error) {
    return errorResponse(res, error);
  }
});

// DELETE /api/accounts/:id — forbid deleting accounts with linked transactions.
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid account ID." });
  }

  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    const linkedCount = await Transaction.countDocuments({
      userId: req.userId,
      accountId: account._id,
    });

    if (linkedCount > 0) {
      return res.status(409).json({
        error: `Cannot delete this account because it has ${linkedCount} linked transaction(s). Reassign or delete those transactions first.`,
      });
    }

    await Account.deleteOne({ _id: account._id, userId: req.userId });
    return res.status(204).end();
  } catch (error) {
    return errorResponse(res, error);
  }
});

export default router;
