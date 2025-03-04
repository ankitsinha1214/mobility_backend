const express = require("express");
const router = express.Router();
const GraphController = require("../controllers/graphController");
const fetchUser = require('../middleware/fetchuser');

router.get("/", 
    // fetchUser, 
    GraphController.getGraphData);

module.exports = router;