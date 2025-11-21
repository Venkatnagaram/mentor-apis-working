const userRepo = require("../repositories/user.repository");

class UserService {
  async getUserProfile(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.formatUserProfile(user);
  }

  async getUserById(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.formatUserProfile(user);
  }

  async updateUserProfile(userId, updateData) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const allowedFields = [
      "personal_info_step1",
      "personal_info_step2",
      "company_info",
      "profile_photo",
      "competencies"
    ];

    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No valid fields to update");
    }

    const updatedUser = await userRepo.updateUser(userId, filteredData);
    if (!updatedUser) {
      throw new Error("User not found");
    }

    return this.formatUserProfile(updatedUser);
  }

  formatUserProfile(user) {
    return {
      id: user._id,
      personal_info_step1: user.personal_info_step1 || null,
      personal_info_step2: user.personal_info_step2 || null,
      company_info: user.company_info || null,
      profile_photo: user.profile_photo || null,
      competencies: user.competencies || null,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}

module.exports = new UserService();
