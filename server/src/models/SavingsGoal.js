import mongoose from "mongoose";

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
      minlength: [2, "Goal name must contain at least 2 characters"],
      maxlength: [100, "Goal name cannot exceed 100 characters"],
    },

    targetAmount: {
      type: Number,
      required: true,
      min: [0.01, "Target amount must be greater than zero"],
      validate: {
        validator: Number.isFinite,
        message: "Target amount must be a valid number",
      },
    },

    currency: {
      type: String,
      enum: ["USD", "LKR"],
      default: "USD",
    },

    deadline: {
      type: String,
      default: "",
      validate: {
        validator(value) {
          if (!value) return true;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

          const date = new Date(`${value}T00:00:00Z`);

          return (
            !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value
          );
        },
        message: "Enter a valid deadline in YYYY-MM-DD format",
      },
    },

    linkedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
  },
  { timestamps: true },
);

savingsGoalSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("SavingsGoal", savingsGoalSchema);
