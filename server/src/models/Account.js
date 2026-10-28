import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
      minlength: [2, "Account name must contain at least 2 characters"],
      maxlength: [80, "Account name cannot exceed 80 characters"],
    },

    type: {
      type: String,
      required: true,
      enum: ["checking", "savings", "cash", "credit", "investment"],
    },

    institution: {
      type: String,
      trim: true,
      default: "",
    },

    openingBalance: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: Number.isFinite,
        message: "Opening balance must be a valid number",
      },
    },

    currency: {
      type: String,
      enum: ["USD", "LKR"],
      default: "USD",
    },

    isLiquid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Account names must be unique for each user.
accountSchema.index({ userId: 1, name: 1 }, { unique: true });

// Convert MongoDB _id into the id used by React.
accountSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Account", accountSchema);
