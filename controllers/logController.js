const ChargerLog = require('../models/logModel');
const ChargerLocation = require('../models/chargerLocationModel');

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
    const chargerLocation = await ChargerLocation.findOne({
      'chargerInfo.name': chargerId
    }).select('locationName locationType freepaid chargerInfo');
    // }).select('locationName locationType state city address direction chargerInfo');

    if (!chargerLocation) {
      return res.json({ status: false, message: 'Charger not found' });
    }

    // Find the specific chargerInfo within the location
    const chargerInfo = chargerLocation.chargerInfo.find(charger => charger.name === chargerId);

    if (!chargerInfo) {
      return res.json({ status: false, message: 'Charger details not found in the location' });
    }
    const locationInfo = {
      locationName: chargerLocation.locationName,
      locationType: chargerLocation.locationType,
    }
    const dataToSend = {
      logs: logs,
      chargerDetails: chargerInfo,
      locationDetails: locationInfo
    }
    res.json({ status: true, data: dataToSend, message: "Charger Logs Fetched Successfully!" });
  } catch (err) {
    console.error("Error fetching charger logs:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
