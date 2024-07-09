const chargerLocationController = require("../controllers/chargerLocationController");
const router = require("express").Router();

// Routes
router.post('/', chargerLocationController.createChargerLocation);
router.get('/', chargerLocationController.getChargerLocations);
router.get('/type', chargerLocationController.getLocationTypes);
router.get('/all-location', chargerLocationController.getAllLocations);
router.get('/:id', chargerLocationController.getChargerLocationById);
router.put('/:id', chargerLocationController.updateChargerLocation);
router.delete('/:id', chargerLocationController.deleteChargerLocation);

module.exports = router;
