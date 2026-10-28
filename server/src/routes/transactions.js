import { Router } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const fieldsAllowed = new Set([
  "name",
  "category",
  "type",
  "amount",
  "date",
  "accountId",
  "account",
  "currency",
]);
const currencies = ["USD", "LKR"];
async function ownedAccount(id, userId) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Account.findOne({ _id: id, userId });
}
function mismatch(body, account) {
  return Object.hasOwn(body, "currency") && body.currency !== account.currency;
}
router.get("/", async (req, res) => {
  try {
    res.json(
      await Transaction.find({ userId: req.userId }).sort({
        date: -1,
        createdAt: -1,
      }),
    );
  } catch {
    res.status(500).json({ error: "Failed to load transactions." });
  }
});
router.post("/", async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body.accountId)
      return res.status(400).json({ error: "Select an account." });
    const account = await ownedAccount(body.accountId, req.userId);
    if (!account || !currencies.includes(account.currency))
      return res
        .status(400)
        .json({ error: "Invalid or inaccessible account." });
    if (mismatch(body, account))
      return res
        .status(400)
        .json({ error: "Currency must match the selected account." });
    // Validate BEFORE creation. Account name/currency are authoritative.
    const saved = await Transaction.create({
      userId: req.userId,
      name: body.name,
      category: body.category,
      type: body.type,
      amount: body.amount,
      date: body.date,
      accountId: account._id,
      account: account.name,
      currency: account.currency,
    });
    res.status(201).json(saved);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ error: "Invalid transaction ID." });
  const body = req.body ?? {};
  if (
    !Object.keys(body).length ||
    Object.keys(body).some((k) => !fieldsAllowed.has(k))
  )
    return res.status(400).json({ error: "Invalid or empty update request." });
  try {
    const existing = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!existing)
      return res.status(404).json({ error: "Transaction not found." });
    const id = Object.hasOwn(body, "accountId")
      ? body.accountId
      : existing.accountId;
    const account = await ownedAccount(id, req.userId);
    if (!account || !currencies.includes(account.currency))
      return res
        .status(400)
        .json({ error: "Select a valid account before updating." });
    if (mismatch(body, account))
      return res
        .status(400)
        .json({ error: "Currency must match the selected account." });
    const changes = {};
    for (const key of ["name", "category", "type", "amount", "date"])
      if (Object.hasOwn(body, key)) changes[key] = body[key];
    Object.assign(changes, {
      accountId: account._id,
      account: account.name,
      currency: account.currency,
    });
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: changes },
      { returnDocument: "after", runValidators: true },
    );
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ error: "Invalid transaction ID." });
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted)
      return res.status(404).json({ error: "Transaction not found." });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Could not delete transaction." });
  }
});
export default router;
