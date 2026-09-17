const express = require("express");

const router = express.Router();

const {
    getFertilizerRecommendation
} = require("../controllers/fertilizerController");


router.post(
    "/recommend",
    getFertilizerRecommendation
);


module.exports = router;