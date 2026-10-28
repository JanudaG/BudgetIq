import mongoose from "mongoose";

const financialSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferredCurrency: { type: String, enum: ["LKR", "USD"], default: "LKR" },
    savingsTarget: { type: Number, default: 30, min: 0, max: 100 },
    discretionaryLimit: { type: Number, default: 30, min: 0, max: 100 },
    runwayTargetMonths: { type: Number, default: 6, min: 0, max: 120 },
    discretionaryCategories: {
      type: [String],
      default: ["Shopping", "Entertainment", "Dining", "Travel"],
    },
  },
  { timestamps: true },
);
financialSettingsSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
export default mongoose.model("FinancialSettings", financialSettingsSchema);
