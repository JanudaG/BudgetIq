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
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    category: { type: String, required: true, trim: true },
    account: { type: String, default: null },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
      index: true,
    },
    // Legacy transactions intentionally remain without currency until verified.
    currency: { type: String, enum: ["USD", "LKR"], default: undefined },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      validate: {
        validator: Number.isFinite,
        message: "Amount must be finite",
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
        message: "Enter a real date in YYYY-MM-DD format",
      },
    },
  },
  { timestamps: true },
);
transactionSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
export default mongoose.model("Transaction", transactionSchema);
