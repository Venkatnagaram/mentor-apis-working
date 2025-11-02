const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");

exports.register = async (req, res, next) => {
  try {
    const { email, password, phone, role } = req.body;

    const existingUser = await userRepo.findByEmail(email);
    if (existingUser)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userRepo.createUser({
      email,
      phone: phone || email,
      password: hashedPassword,
      role: role || "mentee",
      verified: false,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userRepo.findByEmail(email);

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      const lockTimeRemaining = Math.ceil((new Date(user.lock_until) - new Date()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Account locked. Try again in ${lockTimeRemaining} seconds.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const loginAttempts = (user.login_attempts || 0) + 1;
      const updateData = { login_attempts: loginAttempts };

      if (loginAttempts >= parseInt(process.env.MAX_LOGIN_ATTEMPTS || 5)) {
        updateData.lock_until = new Date(Date.now() + parseInt(process.env.LOCK_TIMEOUT || 900000));
      }

      await userRepo.updateUser(user.id, updateData);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await userRepo.updateUser(user.id, {
      login_attempts: 0,
      lock_until: null
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        onboarding_completed: user.onboarding_completed,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { password, otp, otp_expiry, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};
