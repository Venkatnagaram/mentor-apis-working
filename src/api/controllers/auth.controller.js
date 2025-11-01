const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const authService = require("../services/auth.service");

/* -----------------------------
   1️⃣  CHECK EMAIL + PHONE
----------------------------- */
exports.checkEmailPhone = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone)
      return res.status(400).json({ success: false, message: "Email and phone are required" });

    const user = await authService.checkEmailPhone(email, phone);
    res.status(200).json({
      success: true,
      message: "OTP generated (for prototype: 1234)",
      data: { email: user.email, phone: user.phone },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* -----------------------------
   2️⃣  VERIFY OTP (Prototype)
----------------------------- */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    if (otp !== "1234")
      return res.status(400).json({ success: false, message: "Invalid OTP (use 1234 for prototype)" });

    const user = await authService.verifyOtp(email, phone, otp);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: { email: user.email },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* -----------------------------
   3️⃣  PERSONAL INFO UPDATE
----------------------------- */
exports.updatePersonalInfo = async (req, res) => {
  try {
    const { email } = req.body;
    const updated = await authService.updatePersonalInfo(email, req.body);
    res.status(200).json({
      success: true,
      message: "Personal info updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* -----------------------------
   4️⃣  PROFESSIONAL INFO UPDATE
----------------------------- */
exports.updateProfessionalInfo = async (req, res) => {
  try {
    const { email } = req.body;
    const updated = await authService.updateProfessionalInfo(email, req.body);
    res.status(200).json({
      success: true,
      message: "Professional info updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* -----------------------------
   5️⃣  COMPLETE ONBOARDING
----------------------------- */
exports.completeOnboarding = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await authService.completeOnboarding(email);
    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* -----------------------------
   6️⃣  REGISTER (for future admin panel)
----------------------------- */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/* -----------------------------
   7️⃣  LOGIN
----------------------------- */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/* -----------------------------
   8️⃣  GET CURRENT USER
----------------------------- */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -----------------------------
   9️⃣  LOGOUT
----------------------------- */
exports.logout = async (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};
