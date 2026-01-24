import express from "express";
import admin from "./firebase-admin.js";

const router = express.Router();

router.post("/set-admin", async (req, res) => {
  try {
    const { email, isAdmin } = req.body;

    const token = req.headers.authorization?.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    if (!decoded.admin) {
      return res.status(403).json({ message: "Admins only" });
    }

    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(user.uid, {
      admin: isAdmin,
    });

    res.json({
      success: true,
      email,
      admin: isAdmin,
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// remove admin claim
router.post("/remove-admin", async (req, res) => {
  try {
    const { email } = req.body;
    const token = req.headers.authorization?.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    if (!decoded.admin) {
      return res.status(403).json({ message: "Admins only" });
    }
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: false,
    });
    res.json({
      success: true,
      email,
      admin: false,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;