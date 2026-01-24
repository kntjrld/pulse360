import express from "express";
import admin from "./firebase-admin.js";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

// reset admin password
router.post("/admin-reset-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await admin.auth().getUserByEmail(email);

    if (!user.customClaims?.admin) {
      return res.status(403).json({
        message: "Password reset allowed for admin accounts only",
      });
    }

    const resetLink = await admin.auth().generatePasswordResetLink(email);

     const mailOptions = {
      from: '"Admin Portal" <yourgmail@gmail.com>',
      to: email,
      subject: "Password Reset Link",
      html: `
        <p>Hello Admin,</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      message: "Password reset link generated",
    });
  } catch (err) {
    return res.status(404).json({
      message: "User not found or error occurred",
    });
  }
});

export default router;