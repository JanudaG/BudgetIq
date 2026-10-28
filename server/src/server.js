import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import transactionRoutes from "./routes/transactions.js";
import envelopeRoutes from "./routes/envelopes.js";
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/accounts.js";
import savingsGoalRoutes from "./routes/savingsGoals.js";
import savingsContributionRoutes from "./routes/savingsContributions.js";
import financialSettingsRoutes from "./routes/financialSettings.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/transactions", transactionRoutes);
app.use("/api/envelopes", envelopeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/savings-goals", savingsGoalRoutes);
app.use("/api/savings-goals", savingsContributionRoutes);
app.use("/api/settings", financialSettingsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`API running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
