const createSiteSurvey = async (req, res) => {
    try {
        const { userId, locationId } = req.body;

        // Check if the user exists
        const user = await SandmUser.findById(userId);
        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }

        // Check if the location exists
        const location = await ChargerLocation.findById(locationId);
        if (!location) {
            return res.json({ status: false, message: 'Location not found' });
        }

        // If both user and location exist, create the site survey
        const siteSurvey = new SiteSurvey(req.body);
        await siteSurvey.save();

        res.json({ status: true, message: 'Site survey created successfully', data: siteSurvey });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const getAllSiteSurveys = async (req, res) => {
    try {
        const siteSurveys = await SiteSurvey.find();
        if (siteSurveys.length === 0) {
            return res.json({ status: false, message: 'No site surveys found' });
        }
        res.json({ status: true, data: siteSurveys });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const getSiteSurveyById = async (req, res) => {
    try {
        const { id } = req.params;
        const siteSurvey = await SiteSurvey.findById(id);
        if (!siteSurvey) {
            return res.json({ status: false, message: 'Site survey not found' });
        }
        res.json({ status: true, data: siteSurvey });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const getSiteSurveysByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const siteSurveys = await SiteSurvey.find({ userId });
        if (!siteSurveys.length) {
            return res.json({ status: false, message: 'No site surveys found for this user' });
        }
        res.json({ status: true, data: siteSurveys });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const deleteSiteSurveyById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SiteSurvey.findByIdAndDelete(id);
        if (!result) {
            return res.json({ status: false, message: 'Site survey not found' });
        }
        res.json({ status: true, message: 'Site survey deleted successfully', data: result });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

module.exports = { 
    createSiteSurvey, 
    getAllSiteSurveys, 
    getSiteSurveyById, 
    getSiteSurveysByUserId, 
    deleteSiteSurveyById 
};
