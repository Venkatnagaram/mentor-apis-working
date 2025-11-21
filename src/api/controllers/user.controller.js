const userService = require("../services/user.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");

exports.getUserProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const profileData = await userService.getUserProfile(req.user.id);
    return successResponse(res, "User profile retrieved successfully", profileData);
  } catch (err) {
    if (err.message === "User not found") {
      return errorResponse(res, err.message, 404);
    }
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) return errorResponse(res, "User ID is required", 400);

    const profileData = await userService.getUserById(userId);
    return successResponse(res, "User profile retrieved successfully", profileData);
  } catch (err) {
    if (err.message === "User not found") {
      return errorResponse(res, err.message, 404);
    }
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const profileData = await userService.updateUserProfile(req.user.id, req.body);
    return successResponse(res, "Profile updated successfully", profileData);
  } catch (err) {
    if (err.message === "No valid fields to update") {
      return errorResponse(res, err.message, 400);
    }
    if (err.message === "User not found") {
      return errorResponse(res, err.message, 404);
    }
    next(err);
  }
};
