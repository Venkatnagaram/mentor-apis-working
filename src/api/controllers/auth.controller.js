const authService = require("../services/auth.service");
const { successResponse } = require("../../utils/responseHelper");

exports.login = async (req, res, next) => {
  try {
    const { phone, country_code } = req.body;
    const data = await authService.login(phone, country_code);
    return successResponse(res, "OTP sent successfully", data);
  } catch (err) {
    next(err);
  }
};

exports.verifyLogin = async (req, res, next) => {
  try {
    const { phone, country_code, otp } = req.body;
    const data = await authService.verifyLoginOtp(phone, country_code, otp);
    return successResponse(res, "Login successful", data);
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const userData = await authService.getCurrentUser(req.user.id);
    return successResponse(res, "User data retrieved", userData);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const data = await authService.logout();
    return successResponse(res, data.message, data);
  } catch (err) {
    next(err);
  }
};
