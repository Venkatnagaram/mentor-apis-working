const Availability = require("../models/Availability");

class AvailabilityRepository {
  async create(data) {
    const av = new Availability(data);
    await av.save();
    return av.toObject();
  }

  async update(id, data) {
    return await Availability.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
  }

  async delete(id) {
    return await Availability.findByIdAndDelete(id).lean();
  }

  async findByUser(userId) {
    return await Availability.find({ user_id: userId, active: true }).lean();
  }

  async findById(id) {
    return await Availability.findById(id).lean();
  }
}

module.exports = new AvailabilityRepository();
