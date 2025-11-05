const User = require("../models/User");

class UserRepository {
  async createUser(data) {
    const user = new User(data);
    await user.save();
    return user.toObject();
  }

  async findByEmail(email) {
    if (!email) return null;
    return await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" }, // Case-insensitive exact match
    }).lean();
  }

  async findByPhone(phone) {
    return await User.findOne({ phone }).lean();
  }

  async findById(id) {
    return await User.findById(id).lean();
  }

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async getAllUsers(filter = {}) {
    return await User.find(filter).lean();
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id).lean();
  }

  async findByEmailOrPhone(email, phone) {
    const query = {};

    if (email && phone) {
      query.$or = [
        { email: { $regex: `^${email}$`, $options: "i" } },
        { phone },
      ];
    } else if (email) {
      query.email = { $regex: `^${email}$`, $options: "i" };
    } else if (phone) {
      query.phone = phone;
    }

    return await User.findOne(query).lean();
  }
}

module.exports = new UserRepository();
