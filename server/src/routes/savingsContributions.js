import { Router } from "express";
import mongoose from "mongoose";
import SavingsGoal from "../models/SavingsGoal.js";
import SavingsContribution from "../models/SavingsContribution.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// Verify that the goal exists and belongs to this user.
async function findOwnedGoal(req, res) {
  if (!mongoose.isValidObjectId(req.params.goalId)) {
    res.status(400).json({ error: "Invalid savings goal ID." });
    return null;
  }

  const goal = await SavingsGoal.findOne({
    _id: req.params.goalId,
    userId: req.userId,
  });

  if (!goal) {
    res.status(404).json({ error: "Savings goal not found." });
    return null;
  }

  return goal;
}

// GET /api/savings-goals/:goalId/contributions
router.get("/:goalId/contributions", async (req, res) => {
  try {
    const goal = await findOwnedGoal(req, res);
    if (!goal) return;

    const contributions = await SavingsContribution.find({
      goalId: goal._id,
      userId: req.userId,
    }).sort({ date: -1, createdAt: -1 });

    res.json(contributions);
  } catch {
    res.status(500).json({
      error: "Failed to load contributions.",
    });
  }
});

// POST /api/savings-goals/:goalId/contributions
router.post("/:goalId/contributions", async (req, res) => {
  try {
    const goal = await findOwnedGoal(req, res);
    if (!goal) return;

    const { amount, date, note } = req.body ?? {};

    const contribution = await SavingsContribution.create({
      userId: req.userId,
      goalId: goal._id,
      amount,
      date,
      note,
    });

    res.status(201).json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/savings-goals/:goalId/contributions/:id
router.patch("/:goalId/contributions/:id", async (req, res) => {
  try {
    const goal = await findOwnedGoal(req, res);
    if (!goal) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid contribution ID.",
      });
    }

    const allowed = ["amount", "date", "note"];
    const fields = Object.keys(req.body ?? {});

    if (
      fields.length === 0 ||
      fields.some((field) => !allowed.includes(field))
    ) {
      return res.status(400).json({
        error: "Invalid contribution update.",
      });
    }

    const updated = await SavingsContribution.findOneAndUpdate(
      {
        _id: req.params.id,
        goalId: goal._id,
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
        error: "Contribution not found.",
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/savings-goals/:goalId/contributions/:id
router.delete("/:goalId/contributions/:id", async (req, res) => {
  try {
    const goal = await findOwnedGoal(req, res);
    if (!goal) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid contribution ID.",
      });
    }

    const deleted = await SavingsContribution.findOneAndDelete({
      _id: req.params.id,
      goalId: goal._id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({
        error: "Contribution not found.",
      });
    }

    res.status(204).end();
  } catch {
    res.status(500).json({
      error: "Failed to delete contribution.",
    });
  }
});

export default router;
