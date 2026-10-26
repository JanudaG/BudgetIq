import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Transaction name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    category: { type: String, required: true },
    account: { type: String, default: null },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero"],
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a valid number",
      },
    },

    date: {
      type: String,
      required: true,
      validate: {
        validator(value) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

          const parsed = new Date(`${value}T00:00:00Z`);

          return (
            !Number.isNaN(parsed.getTime()) &&
            parsed.toISOString().slice(0, 10) === value
          );
        },
        message: "Enter a valid date in YYYY-MM-DD format",
      },
    },
  },
  { timestamps: true },
);

// MongoDB calls the id `_id`. Your React code uses `id`, so rename it in the JSON we send out.
transactionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Transaction", transactionSchema);
