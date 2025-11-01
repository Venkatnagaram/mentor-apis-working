const User = require("../models/user.model");

class UserRepository {
  async createUser(data) {
    const user = new User(data);
    return await user.save();
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findByPhone(phone) {
    return await User.findOne({ phone });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getAllUsers(filter = {}) {
    return await User.find(filter);
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async findByEmailOrPhone(email, phone) {
    const query = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;
    return await User.findOne(query);
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }
}

module.exports = new UserRepository();
