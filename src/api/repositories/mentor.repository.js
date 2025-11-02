const Mentor = require("../models/Mentor");

class MentorRepository {
  async create(data) {
    const mentor = new Mentor(data);
    await mentor.save();
    return mentor.toObject();
  }

  async findByUserId(userId) {
    return await Mentor.findOne({ user_id: userId }).lean();
  }

  async findById(id) {
    return await Mentor.findById(id).lean();
  }

  async findByIdWithUser(id) {
    return await Mentor.findById(id)
      .populate("user_id", "email personal_info professional_info")
      .lean();
  }

  async findByUserIdWithUser(userId) {
    return await Mentor.findOne({ user_id: userId })
      .populate("user_id", "email personal_info professional_info")
      .lean();
  }

  async update(userId, updateData) {
    return await Mentor.findOneAndUpdate({ user_id: userId }, updateData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async findAll(filter = {}) {
    const query = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.expertiseArea) {
      query.expertise_areas = { $in: [filter.expertiseArea] };
    }

    return await Mentor.find(query)
      .populate("user_id", "email personal_info professional_info")
      .sort({ createdAt: -1 })
      .lean();
  }

  async delete(userId) {
    return await Mentor.findOneAndDelete({ user_id: userId }).lean();
  }
}

module.exports = new MentorRepository();
