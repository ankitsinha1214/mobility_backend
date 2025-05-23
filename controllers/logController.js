const ChargerLog = require('../models/logModel');

// Create log entry
exports.createChargerLog = async (chargerId, action, message) => {
  try {
    await ChargerLog.create({
      chargerId,
      action,
      message
    });
  } catch (err) {
    console.error(`Failed to log charger activity for ${chargerId}:`, err);
  }
};

// Get logs by charger ID
exports.getChargerLogs = async (req, res) => {
  try {
    const { chargerId } = req.params;
    const logs = await ChargerLog.find({ chargerId }).sort({ createdAt: -1 });
    res.json({ status: true, data: logs, message: "Charger Logs Fetched Successfully!" });
  } catch (err) {
    console.error("Error fetching charger logs:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
