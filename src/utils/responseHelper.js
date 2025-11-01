exports.successResponse = (res, message, data) =>
    res.json({ success: true, message, data });
  