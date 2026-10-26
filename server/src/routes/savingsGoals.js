import { Router } from "express";
import mongoose from "mongoose";
import SavingsGoal from "../models/SavingsGoal.js";
import Account from "../models/Account.js";
import { requireAuth } from "../middleware/auth.js";
import SavingsContribution from "../models/SavingsContribution.js";
const router = Router();

router.use(requireAuth);

const allowedFields = [
  "name",
  "targetAmount",
  "currency",
  "deadline",
  "linkedAccountId",
];

// Validate that a linked account belongs to the user
// and uses the same currency as the savings goal.
async function validateLinkedAccount(data, userId) {
  if (!data.linkedAccountId) return null;

  if (!mongoose.isValidObjectId(data.linkedAccountId)) {
    return "Invalid linked account ID.";
  }

  const account = await Account.findOne({
    _id: data.linkedAccountId,
    userId,
  });

  if (!account) {
    return "Linked account not found.";
  }

  if (account.currency !== data.currency) {
    return "Savings goal and account currencies must match.";
  }

  return null;
}

// GET - All savings goals for current user
router.get("/", async (req, res) => {
  try {
    const goals = await SavingsGoal.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(goals);
  } catch {
    res.status(500).json({
      error: "Failed to load savings goals.",
    });
  }
});

// GET - One savings goal
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid savings goal ID.",
    });
  }

  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        error: "Savings goal not found.",
      });
    }

    res.json(goal);
  } catch {
    res.status(500).json({
      error: "Failed to load savings goal.",
    });
  }
});

// POST - Create savings goal
router.post("/", async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      currency = "USD",
      deadline = "",
      linkedAccountId = null,
    } = req.body ?? {};

    const data = {
      name,
      targetAmount,
      currency,
      deadline,
      linkedAccountId,
    };

    const validationError = await validateLinkedAccount(data, req.userId);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const goal = await SavingsGoal.create({
      ...data,
      userId: req.userId,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// PATCH - Edit savings goal
router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid savings goal ID.",
    });
  }

  try {
    const fields = Object.keys(req.body ?? {});

    if (
      fields.length === 0 ||
      fields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        error: "Invalid or empty update request.",
      });
    }

    const existingGoal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!existingGoal) {
      return res.status(404).json({
        error: "Savings goal not found.",
      });
    }

    const nextData = {
      name: existingGoal.name,
      targetAmount: existingGoal.targetAmount,
      currency: existingGoal.currency,
      deadline: existingGoal.deadline,
      linkedAccountId: existingGoal.linkedAccountId,
      ...req.body,
    };

    const validationError = await validateLinkedAccount(nextData, req.userId);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const updated = await SavingsGoal.findOneAndUpdate(
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

    res.json(updated);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// DELETE - Delete savings goal

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid savings goal ID.",
    });
  }

  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        error: "Savings goal not found.",
      });
    }

    const contributionCount = await SavingsContribution.countDocuments({
      goalId: goal._id,
      userId: req.userId,
    });

    if (contributionCount > 0) {
      return res.status(409).json({
        error:
          "Cannot delete this savings goal while it has contributions. Remove its contributions first.",
      });
    }

    await SavingsGoal.deleteOne({
      _id: goal._id,
      userId: req.userId,
    });

    return res.status(204).end();
  } catch {
    return res.status(500).json({
      error: "Failed to delete savings goal.",
    });
  }
});

export default router;
