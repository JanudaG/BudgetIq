import mongoose from "mongoose";

const savingsContributionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavingsGoal",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: [true, "Contribution amount is required"],
      min: [0.01, "Contribution must be greater than zero"],
      validate: {
        validator: Number.isFinite,
        message: "Contribution must be a valid number",
      },
    },

    date: {
      type: String,
      required: true,
      validate: {
        validator(value) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

          const date = new Date(`${value}T00:00:00Z`);
          return (
            !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value
          );
        },
        message: "Enter a valid date in YYYY-MM-DD format",
      },
    },

    note: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
  },
  { timestamps: true },
);

savingsContributionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("SavingsContribution", savingsContributionSchema);
