const chargerLocationController = require("../controllers/chargerLocationController");
const router = require("express").Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fetchUser = require('../middleware/fetchuser');
const SERVICES = require('../constants/services');
const authorizeAccess = require('../middleware/authorizeAccess');
// Routes
router.post('/',
    fetchUser,
    upload.fields([{
        name: 'locationImage', maxCount: 6
    }
    ]), chargerLocationController.createChargerLocation);
router.put('/update-image',
    fetchUser,
    upload.fields([{
        name: 'locationImage', maxCount: 6
    }
    ]), chargerLocationController.updateChargerLocationImage);
router.get('/chargers/all', fetchUser,  authorizeAccess(SERVICES.CHARGER_MGMT), chargerLocationController.getAllChargers);
router.post('/get-charger-info-by-name', fetchUser, chargerLocationController.getChargerLocationsInfoByName);
router.post('/add-charger', fetchUser,  authorizeAccess(SERVICES.CHARGER_MGMT),  chargerLocationController.addChargerToLocation);
router.post('/update-charger', fetchUser,  authorizeAccess(SERVICES.CHARGER_MGMT),  chargerLocationController.updateChargerInLocation);
router.delete('/delete-charger', fetchUser,  authorizeAccess(SERVICES.CHARGER_MGMT),  chargerLocationController.deleteChargerFromLocation);
router.get('/', fetchUser, chargerLocationController.getChargerLocations);
router.get('/type',fetchUser, chargerLocationController.getLocationTypes);
router.get('/location-type-count',fetchUser, chargerLocationController.getLocationTypesCountPercentage);
router.get('/all-location',fetchUser, chargerLocationController.getAllLocations);
router.get('/:id',fetchUser, chargerLocationController.getChargerLocationById);
router.put('/:id',fetchUser,   authorizeAccess(SERVICES.LOCATION_MGMT),  chargerLocationController.updateChargerLocation);
router.delete('/:id',fetchUser,   authorizeAccess(SERVICES.LOCATION_MGMT),  chargerLocationController.deleteChargerLocation);
router.post('/:id',fetchUser,  authorizeAccess(SERVICES.LOCATION_MGMT),  chargerLocationController.changeChargerStatus);
router.post('/location/filter',fetchUser, chargerLocationController.getLocationsByStateCityStatus);
router.post('/location/filter/:checkType', fetchUser, chargerLocationController.getLocationsByStateCityStatusSitesurvey);
router.post('/location/range', fetchUser, chargerLocationController.getChargerLocationsInRange);
router.post('/location/near/range', fetchUser, chargerLocationController.getChargerLocationsNearInRange);
router.get('/location/search', fetchUser, chargerLocationController.searchChargerLocations);
router.get('/dashboard/charger', fetchUser, chargerLocationController.getFilteredChargers);
router.post('/dashboard/get-data', fetchUser, chargerLocationController.getDashboardData);

module.exports = router;