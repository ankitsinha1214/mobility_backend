const chargerLocationController = require("../controllers/chargerLocationController");
const router = require("express").Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post('/',
    upload.fields([{
        name: 'locationImage', maxCount: 6
    }
    ]), chargerLocationController.createChargerLocation);
router.get('/', chargerLocationController.getChargerLocations);
router.get('/type', chargerLocationController.getLocationTypes);
router.get('/all-location', chargerLocationController.getAllLocations);
router.get('/:id', chargerLocationController.getChargerLocationById);
router.put('/:id', chargerLocationController.updateChargerLocation);
router.delete('/:id', chargerLocationController.deleteChargerLocation);
router.post('/:id', chargerLocationController.changeChargerStatus);
router.post('/location/filter', chargerLocationController.getLocationsByStateCityStatus);
router.post('/location/range', chargerLocationController.getChargerLocationsInRange);
router.get('/location/search', chargerLocationController.searchChargerLocations);

module.exports = router;