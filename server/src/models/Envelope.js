import mongoose from "mongoose";

const envelopeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: { type: String, required: true, trim: true },
    group: { type: String, required: true },
    subtitle: { type: String, default: "" },
    limit: {
      type: Number,
      required: true,
      min: 0.01,
      validate: { validator: Number.isFinite, message: "Invalid limit" },
    },
    rollover: { type: Boolean, default: false },
    // Legacy envelopes without currency stay unclassified until verified.
    currency: { type: String, enum: ["USD", "LKR"], default: undefined },
  },
  { timestamps: true },
);
// IMPORTANT: retain existing unique index (userId, category) until index migration.
// Do not declare a conflicting new unique index here.
envelopeSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
export default mongoose.model("Envelope", envelopeSchema);
