const cropNutrientKnowledge =
    require("../FertilizerData/cropNutrientKnowledge");

const FertilizerRecommendation =
    require('../models/FertilizerRecommendation');

// Convert nutrient demand to a numeric score
const DEVELOPMENT_THRESHOLDS = {
    low: 30,
    medium: 70
};

const demandScore = {
    low: 1,
    medium: 2,
    high: 3
};

const fertilizerKnowledge = {

    nitrogen: {
        nutrient: "Nitrogen",
        fertilizer: "Urea",
        alternatives: [
            "Ammonium Sulphate"
        ],
        reason:
            "The soil nitrogen level is lower than the crop requirement."
    },

    phosphorus: {
        nutrient: "Phosphorus",
        fertilizer: "DAP",
        alternatives: [
            "SSP"
        ],
        reason:
            "The soil phosphorus level is lower than the crop requirement."
    },

    potassium: {
        nutrient: "Potassium",
        fertilizer: "MOP",
        alternatives: [
            "SOP"
        ],
        reason:
            "The soil potassium level is lower than the crop requirement."
    }

};

// Temporary nutrient status function
function getNutrientStatus(value) {

    if (value < DEVELOPMENT_THRESHOLDS.low) {
        return "low";
    }

    if (value < DEVELOPMENT_THRESHOLDS.medium) {
        return "medium";
    }

    return "high";
}

function generateRecommendations(priority) {

    const deficientNutrients = Object.keys(priority)
        .filter(nutrient => priority[nutrient] > 0);

    // No nutrient requires attention
    if (deficientNutrients.length === 0) {

        return {
            overallRecommendation:
                "No additional fertilizer required.",

            recommendedFertilizers: [],

            explanation:
                "The detected NPK levels are currently adequate for the crop requirements."
        };
    }


    let overallRecommendation = "";

    const hasN =
        deficientNutrients.includes("nitrogen");

    const hasP =
        deficientNutrients.includes("phosphorus");

    const hasK =
        deficientNutrients.includes("potassium");


    // Determine overall nutrient management

    if (hasN && hasP && hasK) {

        overallRecommendation =
            "Balanced NPK nutrient management required.";

    }

    else if (hasN && hasP) {

        overallRecommendation =
            "Nitrogen and phosphorus nutrient management required.";

    }

    else if (hasN && hasK) {

        overallRecommendation =
            "Nitrogen and potassium nutrient management required.";

    }

    else if (hasP && hasK) {

        overallRecommendation =
            "Phosphorus and potassium nutrient management required.";

    }

    else {

        overallRecommendation =
            `${fertilizerKnowledge[
                deficientNutrients[0]
            ].nutrient} nutrient management required.`;

    }


    // Individual fertilizer recommendations

    const recommendedFertilizers =
        deficientNutrients.map(nutrient => ({

            nutrient:
                fertilizerKnowledge[nutrient].nutrient,

            fertilizer:
                fertilizerKnowledge[nutrient].fertilizer,

            alternatives:
                fertilizerKnowledge[nutrient].alternatives,

            priority:
                priority[nutrient],

            why:
                fertilizerKnowledge[nutrient].reason

        }));


    return {

        overallRecommendation,

        recommendedFertilizers,

        explanation:
            "Recommendations are based on the difference between crop nutrient requirements and detected soil nutrient status."

    };

}

function generateXAIExplanation(
    crop,
    cropData,
    soilStatus,
    priority
) {

    const explanations = [];

    explanations.push(
        ` ${crop} requires ${cropData.nitrogen}, ${cropData.phosphorus}, and ${cropData.potassium} levels of nitrogen, phosphorus, and potassium respectively.`
    );

    const nutrientNames = {
        nitrogen: "Nitrogen",
        phosphorus: "Phosphorus",
        potassium: "Potassium"
    };

    for (const nutrient in priority) {

        const name = nutrientNames[nutrient];

        if (priority[nutrient] > 0) {

            explanations.push(
                ` ${name} requires attention because the crop requirement is ${cropData[nutrient]}, while the detected soil level is ${soilStatus[nutrient]}.`
            );

        } else {

            explanations.push(
                ` ${name} is currently adequate for the crop and does not have a positive nutrient priority.`
            );

        }

    }

    return explanations;
}

// Main Fertilizer Recommendation API
const getFertilizerRecommendation = async (req, res) => {

    try {

        const {
            crop,
            nitrogen,
            phosphorus,
            potassium
        } = req.body;


        // Validate required inputs
        if (
            !crop ||
            nitrogen === undefined ||
            phosphorus === undefined ||
            potassium === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Crop, nitrogen, phosphorus and potassium values are required"
            });
        }

        const n = Number(nitrogen);
        const p = Number(phosphorus);
        const k = Number(potassium);

        if (
            Number.isNaN(n) ||
            Number.isNaN(p) ||
            Number.isNaN(k)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Nitrogen, phosphorus and potassium must be valid numeric values."
            });
        }

        if (n < 0 || p < 0 || k < 0) {
            return res.status(400).json({
                success: false,
                message:
                    "NPK values cannot be negative."
            });
        }

        // Check crop
        if (!cropNutrientKnowledge[crop]) {

            return res.status(400).json({
                success: false,
                message: "Crop is not supported"
            });

        }


        // Get crop requirements
        const cropData =
            cropNutrientKnowledge[crop];


        // Soil nutrient status
        const soilStatus = {
            nitrogen: getNutrientStatus(n),
            phosphorus: getNutrientStatus(p),
            potassium: getNutrientStatus(k)
        };


        // Convert soil status into scores
        const soilScore = {

            low: 1,
            medium: 2,
            high: 3
        };


        // Calculate nutrient priority
        const priority = {

            nitrogen:
                demandScore[cropData.nitrogen] -
                soilScore[soilStatus.nitrogen],

            phosphorus:
                demandScore[cropData.phosphorus] -
                soilScore[soilStatus.phosphorus],

            potassium:
                demandScore[cropData.potassium] -
                soilScore[soilStatus.potassium]
        };

        const recommendations = generateRecommendations(priority);

        const xaiExplanation =
        generateXAIExplanation(
            crop,
            cropData,
            soilStatus,
            priority
        );

        const newFertilizerRecommendation =
            new FertilizerRecommendation({

                userId: req.session.user._id,

                crop,

                nitrogen: n,

                phosphorus: p,

                potassium: k,

                soilStatus: {
                    nitrogen: soilStatus.nitrogen,
                    phosphorus: soilStatus.phosphorus,
                    potassium: soilStatus.potassium
                },

                priority: {
                    nitrogen: priority.nitrogen,
                    phosphorus: priority.phosphorus,
                    potassium: priority.potassium
                },

                recommendedFertilizers:
                    recommendations.recommendedFertilizers || [],

                overallRecommendation:
                    recommendations.overallRecommendation || ''

            });

        await newFertilizerRecommendation.save();

        res.json({

            success: true,

            crop,

            cropRequirement: cropData,

            soilStatus,

            priority,

            recommendations,

            xaiExplanation

        });

    }

    catch (error) {

        console.error(
            "Fertilizer recommendation error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to generate fertilizer recommendation."

        });

    }

};


module.exports = {
    getFertilizerRecommendation
};