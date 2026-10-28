import { Router } from "express";
import FinancialSettings from "../models/FinancialSettings.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);
const allowed = [
  "preferredCurrency",
  "savingsTarget",
  "discretionaryLimit",
  "runwayTargetMonths",
  "discretionaryCategories",
];
router.get("/", async (req, res) => {
  try {
    const data = await FinancialSettings.findOneAndUpdate(
      { userId: req.userId },
      { $setOnInsert: { userId: req.userId } },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    res.json(data);
  } catch {
    res.status(500).json({ error: "Could not load settings." });
  }
});
router.patch("/", async (req, res) => {
  const changes = req.body ?? {};
  if (
    !Object.keys(changes).length ||
    Object.keys(changes).some((k) => !allowed.includes(k))
  )
    return res.status(400).json({ error: "Invalid update." });
  if (
    Object.hasOwn(changes, "preferredCurrency") &&
    !["USD", "LKR"].includes(changes.preferredCurrency)
  )
    return res.status(400).json({ error: "Invalid reporting currency." });
  for (const key of [
    "savingsTarget",
    "discretionaryLimit",
    "runwayTargetMonths",
  ]) {
    if (!Object.hasOwn(changes, key)) continue;
    const value = changes[key],
      max = key === "runwayTargetMonths" ? 120 : 100;
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > max
    )
      return res.status(400).json({ error: `Invalid ${key}.` });
  }
  if (Object.hasOwn(changes, "discretionaryCategories")) {
    if (
      !Array.isArray(changes.discretionaryCategories) ||
      changes.discretionaryCategories.some(
        (c) => typeof c !== "string" || !c.trim() || c.length > 80,
      )
    )
      return res.status(400).json({ error: "Invalid categories." });
    changes.discretionaryCategories = [
      ...new Set(changes.discretionaryCategories.map((c) => c.trim())),
    ];
  }
  try {
    const data = await FinancialSettings.findOneAndUpdate(
      { userId: req.userId },
      { $set: changes, $setOnInsert: { userId: req.userId } },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
export default router;
