const userRepo = require("../repositories/user.repository");

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
