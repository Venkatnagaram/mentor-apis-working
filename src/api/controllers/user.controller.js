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

exports.getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.query;

    if (!role) {
      return errorResponse(res, "Role parameter is required", 400);
    }

    const users = await userService.getUsersByRole(role);
    return successResponse(res, `${role}s retrieved successfully`, {
      count: users.length,
      users,
    });
  } catch (err) {
    if (err.message.includes("Invalid role")) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
};
