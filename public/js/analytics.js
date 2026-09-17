document.addEventListener('DOMContentLoaded', () => {

    let cropsChart;
    let seasonChart;
    let npkChart;
    let fertilizerChart;

    const cropColors = [
        '#2E7D32',
        '#66BB6A',
        '#FFA726',
        '#FFB74D',
        '#8BC34A',
        '#43A047',
        '#F9A825',
        '#7CB342',
        '#FB8C00',
        '#558B2F',
        '#EF6C00',
        '#689F38',
        '#F57C00',
        '#9CCC65'
    ];

    const seasonColors = {
        Kharif: '#2E7D32',
        Rabi: '#FFA726',
        Zaid: '#EF6C00'
    };

    // ==========================================
    // FETCH ANALYTICS DATA
    // ==========================================

    async function fetchAndRenderCharts() {

        try {

            const response =
                await fetch('/api/analytics');

            if (!response.ok) {
                throw new Error(
                    'Failed to fetch analytics data'
                );
            }

            const data =
                await response.json();

            console.log(
                'Analytics data:',
                data
            );


            // ==========================================
            // 1. MOST RECOMMENDED CROPS
            // ==========================================

            const cropLabels =
                data.mostRecommendedCrops.map(
                    item => formatCropName(item._id)
                );

            const cropCounts =
                data.mostRecommendedCrops.map(
                    item => item.count
                );


            const cropsCtx =
                document
                    .getElementById('crops-chart')
                    .getContext('2d');


            if (cropsChart) {
                cropsChart.destroy();
            }


            cropsChart = new Chart(
                cropsCtx,
                {
                    type: 'doughnut',

                    data: {
                        labels: cropLabels,

                        datasets: [{
                            data: cropCounts,
                            backgroundColor: cropCounts.map(
                                (_, index) =>
                                    cropColors[index % cropColors.length]
                            ),
                            borderWidth: 1
                        }]
                    },

                    options: {
                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                }
            );


            // ==========================================
            // 2. RECOMMENDATIONS BY SEASON
            // ==========================================

            const seasonLabels =
                data.recommendationsBySeason.map(
                    item => item._id
                );

            const seasonCounts =
                data.recommendationsBySeason.map(
                    item => item.count
                );


            const seasonCtx =
                document
                    .getElementById('season-chart')
                    .getContext('2d');


            if (seasonChart) {
                seasonChart.destroy();
            }


            seasonChart = new Chart(
                seasonCtx,
                {
                    type: 'pie',

                    data: {
                        labels: seasonLabels,

                        datasets: [{
                        data: seasonCounts,
                        backgroundColor: seasonLabels.map(
                            season =>
                                seasonColors[season] || '#81C784'
                        ),
                        borderWidth: 1
                    }]
                    },

                    options: {
                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                }
            );


            // ==========================================
            // 3. NPK NUTRIENT ANALYSIS
            // ==========================================

            const npkCtx =
                document
                    .getElementById('npk-chart')
                    .getContext('2d');


            if (npkChart) {
                npkChart.destroy();
            }


            npkChart = new Chart(
                npkCtx,
                {
                    type: 'bar',

                    data: {

                        labels: [
                            'Nitrogen',
                            'Phosphorus',
                            'Potassium'
                        ],

                        datasets: [

                            {
                                label: 'Low',

                                data: [
                                    data.npkAnalysis.nitrogen.low,
                                    data.npkAnalysis.phosphorus.low,
                                    data.npkAnalysis.potassium.low
                                ],

                                backgroundColor: '#EF6C00'
                            },

                           {
                                label: 'Medium',

                                data: [
                                    data.npkAnalysis.nitrogen.medium,
                                    data.npkAnalysis.phosphorus.medium,
                                    data.npkAnalysis.potassium.medium
                                ],

                                backgroundColor: '#FFA726'
                            },

                            {
                                label: 'High',

                                data: [
                                    data.npkAnalysis.nitrogen.high,
                                    data.npkAnalysis.phosphorus.high,
                                    data.npkAnalysis.potassium.high
                                ],

                                backgroundColor: '#43A047'
                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        scales: {

                            y: {
                                beginAtZero: true,

                                ticks: {
                                    precision: 0
                                }
                            }

                        },

                        plugins: {

                            legend: {
                                position: 'top'
                            }

                        }

                    }

                }
            );

            // ==========================================
            // 4. FERTILIZER ANALYSIS
            // ==========================================

            const fertilizerCtx =
                document
                    .getElementById('fertilizer-chart')
                    .getContext('2d');

            if (fertilizerChart) {
                fertilizerChart.destroy();
            }

            const fertilizerLabels =
                (data.fertilizerAnalysis || []).map(
                    item => item._id
                );

            const fertilizerCounts =
                (data.fertilizerAnalysis || []).map(
                    item => item.count
                );

            fertilizerChart = new Chart(
                fertilizerCtx,
                {
                    type: 'bar',
                    data: {
                        labels: fertilizerLabels,
                        datasets: [{
                            label: 'Recommendations',
                            data: fertilizerCounts,
                            backgroundColor: [
                                '#2E7D32',
                                '#66BB6A',
                                '#FFA726',
                                '#FFB74D',
                                '#8BC34A',
                                '#43A047'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    precision: 0
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                }
            );

        }

        catch (error) {

            console.error(
                'Analytics error:',
                error
            );

        }

    }


    // ==========================================
    // FORMAT CROP NAME
    // ==========================================

    function formatCropName(crop) {

        if (!crop) {
            return '';
        }

        return crop
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, letter =>
                letter.toUpperCase()
            );

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    fetchAndRenderCharts();

});