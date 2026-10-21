import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const signToken = (user) =>
  jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password || String(password).length < 6) {
    return res
      .status(400)
      .json({
        error:
          "Name, email and a password of at least 6 characters are required.",
      });
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists)
    return res.status(409).json({ error: "That email is already registered." });

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ token: signToken(user), user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = email
    ? await User.findOne({ email: String(email).toLowerCase() })
    : null;
  const ok =
    user && (await bcrypt.compare(String(password ?? ""), user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Invalid email or password." });

  res.json({ token: signToken(user), user });
});

// Who am I? The React app will call this on page load to restore a session.
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ error: "User no longer exists." });
  res.json(user);
});

export default router;
