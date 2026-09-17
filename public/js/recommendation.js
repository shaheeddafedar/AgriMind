document.addEventListener('DOMContentLoaded', () => {

    const fertilizerData =
        JSON.parse(
            localStorage.getItem('fertilizerRecommendationResult')
        );

    const resultData =
        JSON.parse(
            localStorage.getItem('recommendationResult')
        );


    // ==========================================
    // FERTILIZER RESULT
    // ==========================================

    if (fertilizerData) {

        document.getElementById('crop-result').style.display =
            'none';

        document.getElementById('fertilizer-result').style.display =
            'block';


        // Crop name
        document.getElementById('fertilizer-crop-name').textContent =
            fertilizerData.crop;


        // ==========================================
        // FERTILIZER RECOMMENDATIONS
        // ==========================================

        const recommendationsContainer =
            document.getElementById(
                'fertilizer-recommendations'
            );

        recommendationsContainer.innerHTML = '';

        const recommendations =
            fertilizerData.recommendations;


        // Overall recommendation
        if (
            recommendations &&
            recommendations.overallRecommendation
        ) {

            const overall =
                document.createElement('p');

            overall.innerHTML = `
                <strong>Overall Recommendation:</strong>
                ${recommendations.overallRecommendation}
            `;

            recommendationsContainer.appendChild(overall);

        }


        // Individual fertilizer recommendations
        if (
            recommendations &&
            recommendations.recommendedFertilizers &&
            recommendations.recommendedFertilizers.length > 0
        ) {

            recommendations.recommendedFertilizers.forEach(
                recommendation => {

                    const div =
                        document.createElement('div');

                    div.className =
                        'fertilizer-recommendation-item';

                    div.innerHTML = `
                        <strong>
                            ${recommendation.nutrient}
                        </strong>

                        <p>
                            <strong>Fertilizer:</strong>
                            ${recommendation.fertilizer}
                        </p>

                        <p>
                            <strong>Alternative:</strong>
                            ${recommendation.alternatives.join(', ')}
                        </p>

                        <p>
                            <strong>Why:</strong>
                            ${recommendation.why}
                        </p>
                    `;

                    recommendationsContainer.appendChild(div);

                }
            );

        }


        // ==========================================
        // SOIL STATUS
        // ==========================================

        const soilStatus =
            document.getElementById(
                'fertilizer-soil-status'
            );

        soilStatus.innerHTML = '';


        if (fertilizerData.soilStatus) {

            Object.entries(
                fertilizerData.soilStatus
            ).forEach(([nutrient, status]) => {

                const li =
                    document.createElement('li');

                li.innerHTML = `
                    <strong>${nutrient}:</strong>
                    ${status}
                `;

                soilStatus.appendChild(li);

            });

        }


        // ==========================================
        // PRIORITY
        // ==========================================

        const priority =
            document.getElementById(
                'fertilizer-priority'
            );

        priority.innerHTML = '';


        if (fertilizerData.priority) {

            Object.entries(
                fertilizerData.priority
            ).forEach(([nutrient, value]) => {

                const li =
                    document.createElement('li');

                li.innerHTML = `
                    <strong>${nutrient}:</strong>
                    ${value}
                `;

                priority.appendChild(li);

            });

        }


        // ==========================================
        // XAI EXPLANATION
        // ==========================================

        const xaiContainer =
            document.getElementById('fertilizer-xai');

        xaiContainer.innerHTML = '';

        const xaiExplanations =
            fertilizerData.xaiExplanation || [];


        if (xaiExplanations.length > 0) {

            xaiExplanations.forEach(explanation => {

                const li =
                    document.createElement('li');

                li.textContent =
                    explanation.trim();

                xaiContainer.appendChild(li);

            });

        } else {

            const li =
                document.createElement('li');

            li.textContent =
                'The recommendation is based on the crop requirement and soil nutrient status.';

            xaiContainer.appendChild(li);

        }


        return;
    }


    // ==========================================
    // CROP RESULT
    // ==========================================

    if (!resultData) {

        document.querySelector(
            'main.container'
        ).innerHTML =
            '<h2>No recommendation data found. Please go back to the dashboard and submit the form.</h2>';

        return;
    }


    // ==========================================
    // DYNAMIC CROP ECONOMICS
    // ==========================================

    const cropEconomics =
        resultData.cropEconomics;


    if (!cropEconomics) {

        console.error(
            'Crop economics data not found:',
            resultData
        );

        alert(
            'Crop economic data is unavailable. Please submit the recommendation again.'
        );

        return;
    }


    // ==========================================
    // CROP NAME
    // ==========================================

    document.getElementById(
        'crop-name'
    ).textContent =
        resultData.recommendedCrop;


    // ==========================================
    // CROP REASONS
    // ==========================================

    const reasonsList =
        document.getElementById('crop-reasons');

    reasonsList.innerHTML = '';

    const reasons =
        resultData.reasons || [];


    reasons.forEach((reason) => {

        const li =
            document.createElement('li');

        li.innerHTML = `
            <strong>${reason.title}</strong>
            <span>${reason.text}</span>
        `;

        reasonsList.appendChild(li);

    });


    // ==========================================
    // GET DYNAMIC VALUES
    // ==========================================

    const yieldPerHectare =
        Number(
            cropEconomics.yieldPerHectare
        );


    const totalYield =
        Number(
            cropEconomics.totalYield
        );


    const investment =
        Number(
            cropEconomics.investment
        );


    const grossRevenue =
        cropEconomics.grossRevenue !== null &&
        cropEconomics.grossRevenue !== undefined
            ? Number(cropEconomics.grossRevenue)
            : null;


    const netProfit =
        cropEconomics.netProfit !== null &&
        cropEconomics.netProfit !== undefined
            ? Number(cropEconomics.netProfit)
            : null;


    const area =
        Number(
            cropEconomics.area
        );


    // ==========================================
    // KEY METRICS
    // ==========================================

    document.getElementById(
        'yield'
    ).textContent =
        yieldPerHectare.toFixed(2);


    // ==========================================
    // PROFIT POTENTIAL
    // ==========================================

    let profitPotential =
        'Not Available';


    if (
        netProfit !== null &&
        investment > 0
    ) {

        const profitPercentage =
            (netProfit / investment) * 100;


        if (profitPercentage >= 50) {

            profitPotential =
                'High';

        } else if (profitPercentage >= 20) {

            profitPotential =
                'Medium';

        } else if (profitPercentage >= 0) {

            profitPotential =
                'Low';

        } else {

            profitPotential =
                'Negative';

        }

    }


    document.getElementById(
        'profit-potential'
    ).textContent =
        profitPotential;


    // ==========================================
    // SUSTAINABILITY
    // ==========================================

    // There is currently no actual
    // sustainability model in the system.
    // Therefore we do not show a random score.

    document.getElementById(
        'sustainability'
    ).textContent =
        'Approx.';


    // ==========================================
    // FINANCIAL VALUES
    // ==========================================

    document.getElementById(
        'gross-revenue'
    ).textContent =

        grossRevenue !== null

            ?
              grossRevenue.toLocaleString('en-IN')

            : 'Not available';


    document.getElementById(
        'investment'
    ).textContent =
        investment.toLocaleString('en-IN');


    document.getElementById(
    'net-profit'
).textContent =

    netProfit !== null

        ? netProfit.toLocaleString('en-IN')

        : 'Not available';


    // ==========================================
    // PROFIT PIE CHART
    // ==========================================

    const pieCanvas =
        document.getElementById(
            'profit-pie-chart'
        );


    const pieCtx =
        pieCanvas.getContext('2d');


    new Chart(pieCtx, {

        type: 'pie',

        data: {

            labels: [
                'Net Profit',
                'Investment Cost'
            ],

            datasets: [{

                data: [

                    Math.max(
                        netProfit || 0,
                        0
                    ),

                    investment

                ],

                backgroundColor: [
                    '#2E8B57',
                    '#F4A460'
                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            devicePixelRatio:
                window.devicePixelRatio || 1,

            plugins: {

                legend: {

                    display: true,

                    position: 'top',

                    labels: {

                        boxWidth: 20,

                        padding: 12,

                        font: {

                            size: 12

                        }

                    }

                }

            }

        }

    });


    // ==========================================
    // YIELD COMPARISON
    // ==========================================

    // Approximate reference yields per hectare.
    // These are comparison values only.

    // ==========================================
    // DYNAMIC YIELD COMPARISON
    // ==========================================

    const recommendedCrop =
        resultData.recommendedCrop;

    const yieldComparison =
        cropEconomics.yieldComparison || [];


    // Get recommended crop key
    const recommendedCropKey =
        recommendedCrop.toLowerCase().trim();


    // Select comparison crops
    // Exclude the recommended crop itself
    const comparisonCrops =
        yieldComparison
            .filter(item =>
                item.crop.toLowerCase() !== recommendedCropKey
            )
            .slice(0, 3);


    // ==========================================
    // YIELD BAR CHART
    // ==========================================

    const barCanvas =
        document.getElementById(
            'yield-bar-chart'
        );


    const barCtx =
        barCanvas.getContext('2d');


    new Chart(barCtx, {

        type: 'bar',

        data: {

            labels: [

                recommendedCrop,

                ...comparisonCrops.map(item =>
                    item.crop.charAt(0).toUpperCase() +
                    item.crop.slice(1) +
                    ' (Avg)'
                )

            ],

            datasets: [{

                label:
                    'Yield (Tonnes per Hectare)',

                data: [

                    yieldPerHectare,

                    ...comparisonCrops.map(item =>
                        item.yieldPerHectare
                    )

                ],

                backgroundColor: [

                    '#2E8B57',

                    '#a9a9a9',

                    '#a9a9a9',

                    '#a9a9a9'

                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            devicePixelRatio:
                window.devicePixelRatio || 1,

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 1,

                        font: {

                            size: 11

                        }

                    }

                },

                x: {

                    ticks: {

                        autoSkip: false,

                        maxRotation: 0,

                        minRotation: 0,

                        font: {

                            size: 11

                        }

                    }

                }

            },

            plugins: {

                legend: {

                    display: true,

                    labels: {

                        padding: 10,

                        font: {

                            size: 11

                        }

                    }

                }

            }

        }

    });


    // ==========================================
    // AI MODEL XAI (SHAP)
    // ==========================================

    const modelXai =
        document.getElementById('model-xai');


    modelXai.innerHTML = '';


    // ==========================================
    // DISPLAY SHAP EXPLANATIONS
    // ==========================================

    const xaiExplanations =
        resultData.modelXAI || [];


    if (xaiExplanations.length > 0) {

        xaiExplanations.forEach(
            explanation => {

                const li =
                    document.createElement('li');

                li.textContent =
                    explanation;

                modelXai.appendChild(li);

            }
        );

    } else {


        // ==========================================
        // FALLBACK SHAP CONTRIBUTIONS
        // ==========================================

        const contributions =
            resultData.shapContributions || [];


        if (contributions.length > 0) {

            contributions.forEach(item => {

                const li =
                    document.createElement('li');


                const value =
                    Number(
                        item.shapValue
                    );


                const direction =
                    value >= 0

                        ? 'positively supported'

                        : 'negatively influenced';


                li.textContent =
                    `${item.feature} ${direction} the ${resultData.recommendedCrop} prediction.`;


                modelXai.appendChild(li);

            });


        } else {

            const li =
                document.createElement('li');


            li.textContent =
                'Model explanation is not available for this prediction.';


            modelXai.appendChild(li);

        }

    }

});