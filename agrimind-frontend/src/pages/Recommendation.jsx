import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import '../assets/css/recommendation.css';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

const Recommendation = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [resultData] = useState(() => {
        const cropRes = localStorage.getItem('recommendationResult');
        try {
            return cropRes ? JSON.parse(cropRes) : null;
        } catch {
            return null;
        }
    });

    const [fertilizerData] = useState(() => {
        const fertRes = localStorage.getItem('fertilizerRecommendationResult');
        try {
            return fertRes ? JSON.parse(fertRes) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (!fertilizerData && !resultData) {
            navigate('/dashboard');
        }
    }, [fertilizerData, resultData, navigate]);

    if (!fertilizerData && !resultData) {
        return (
            <main className="container">
                <h2>{t('no_rec_data', 'No recommendation data found. Please go back to the dashboard and submit the form.')}</h2>
                <div className="actions">
                    <Link to="/dashboard" className="btn">
                        <i className="fas fa-arrow-left"></i> {t('back_dashboard', 'Back to Dashboard')}
                    </Link>
                </div>
            </main>
        );
    }

    // --- Crop Economics and Charts calculation ---
    const eco = resultData?.cropEconomics;
    const yieldPerHectare = Number(eco?.yieldPerHectare || 0);
    const investment = Number(eco?.investment || 0);
    const grossRevenue = eco?.grossRevenue !== null && eco?.grossRevenue !== undefined ? Number(eco.grossRevenue) : null;
    const netProfit = eco?.netProfit !== null && eco?.netProfit !== undefined ? Number(eco.netProfit) : null;

    let profitPotential = t('profit_na', 'Not Available');
    if (netProfit !== null && investment > 0) {
        const profitPercentage = (netProfit / investment) * 100;
        if (profitPercentage >= 50) {
            profitPotential = t('profit_high', 'High');
        } else if (profitPercentage >= 20) {
            profitPotential = t('profit_medium', 'Medium');
        } else if (profitPercentage >= 0) {
            profitPotential = t('profit_low', 'Low');
        } else {
            profitPotential = t('profit_negative', 'Negative');
        }
    }

    const pieData = {
        labels: ['Net Profit', 'Investment Cost'],
        datasets: [
            {
                data: [Math.max(netProfit || 0, 0), investment],
                backgroundColor: ['#2E8B57', '#F4A460']
            }
        ]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 20,
                    padding: 12,
                    font: { size: 12 }
                }
            }
        }
    };

    const recommendedCrop = resultData?.recommendedCrop || '';
    const recommendedCropKey = recommendedCrop.toLowerCase().trim();
    const yieldComparison = eco?.yieldComparison || [];
    const comparisonCrops = yieldComparison
        .filter(item => item.crop.toLowerCase() !== recommendedCropKey)
        .slice(0, 3);

    const barData = {
        labels: [
            recommendedCrop,
            ...comparisonCrops.map(item => item.crop.charAt(0).toUpperCase() + item.crop.slice(1) + ' (Avg)')
        ],
        datasets: [
            {
                label: 'Yield (Tonnes per Hectare)',
                data: [
                    yieldPerHectare,
                    ...comparisonCrops.map(item => item.yieldPerHectare)
                ],
                backgroundColor: ['#2E8B57', '#a9a9a9', '#a9a9a9', '#a9a9a9']
            }
        ]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 1,
                    font: { size: 11 }
                }
            },
            x: {
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: { size: 11 }
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                labels: {
                    padding: 10,
                    font: { size: 11 }
                }
            }
        }
    };

    return (
        <main className="container">
            {/* ==========================================
                 CROP RESULT
                 ========================================== */}
            <div id="crop-result" style={{ display: fertilizerData ? 'none' : 'block' }}>
                <div className="result-header">
                    <h2>{t('recommendation_ready', 'Your AI-Powered Recommendation is Ready!')}</h2>
                    <p>{t('recommendation_desc', 'Based on your inputs, we recommend the following crop for optimal results.')}</p>
                </div>

                <div className="result-grid">
                    <div className="result-card recommended-crop">
                        <h3>{t('recommended_crop', 'Recommended Crop')}: <span id="crop-name">{recommendedCrop}</span></h3>
                        <div className="reason">
                            <h4>
                                <i className="fas fa-lightbulb"></i>
                                {' '}{t('why_crop', 'Why was this crop recommended?')}
                            </h4>

                            <ul id="crop-reasons">
                                {(resultData?.reasons || []).map((reason, index) => (
                                    <li key={index}>
                                        <strong>{reason.title}</strong>
                                        <span>{reason.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="result-card large-card">
                        <h4>
                            <i className="fas fa-brain"></i>
                            {' '}{t('ai_model_explanation', 'AI Model Explanation')}
                        </h4>

                        <ul id="model-xai">
                            {resultData?.modelXAI && resultData.modelXAI.length > 0 ? (
                                resultData.modelXAI.map((explanation, index) => (
                                    <li key={index}>{explanation}</li>
                                ))
                            ) : resultData?.shapContributions && resultData.shapContributions.length > 0 ? (
                                resultData.shapContributions.map((item, index) => (
                                    <li key={index}>
                                        {item.feature} {Number(item.shapValue) >= 0 ? 'positively supported' : 'negatively influenced'} the {resultData.recommendedCrop} prediction.
                                    </li>
                                ))
                            ) : (
                                <li>Model explanation is not available for this prediction.</li>
                            )}
                        </ul>
                    </div>

                    <div className="result-card">
                        <h4><i className="fas fa-chart-line"></i> {t('key_metrics', 'Key Metrics (Estimated)')}</h4>
                        <ul>
                            <li><strong>{t('yield', 'Yield')}:</strong> <span id="yield">{yieldPerHectare.toFixed(2)}</span> Tonnes/Hectare</li>
                            <li><strong>{t('profit_potential', 'Profit Potential')}:</strong> <span id="profit-potential">{profitPotential}</span></li>
                        </ul>
                    </div>

                    <div className="result-card large-card">
                        <h4><i className="fas fa-dollar-sign"></i> {t('financial_projections', 'Financial Projections')}</h4>
                        <p className="estimate-note">
                            <i className="fas fa-info-circle"></i>
                            {' '}{t('estimate_note', 'Approximate estimate based on the selected crop, farm area, estimated cultivation costs and latest available market price. Actual values may vary.')}
                        </p>
                        <div className="financials">
                            <p><strong>{t('gross_revenue', 'Gross Revenue')}:</strong> ₹<span id="gross-revenue">{grossRevenue !== null ? grossRevenue.toLocaleString('en-IN') : 'Not available'}</span></p>
                            <p><strong>{t('investment', 'Investment')}:</strong> ₹<span id="investment">{investment.toLocaleString('en-IN')}</span></p>
                            <p><strong>{t('net_profit', 'Net Profit')}:</strong> ₹<span id="net-profit">{netProfit !== null ? netProfit.toLocaleString('en-IN') : 'Not available'}</span></p>
                        </div>
                        <div className="chart-container">
                            <Pie data={pieData} options={pieOptions} />
                        </div>
                    </div>

                    <div className="result-card large-card">
                        <h4><i className="fas fa-tractor"></i> {t('yield_comparison', 'Yield Comparison (Tonnes per Hectare)')}</h4>
                        <div className="chart-container">
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================================
                 FERTILIZER RESULT
                 ========================================== */}
            <div id="fertilizer-result" style={{ display: fertilizerData ? 'block' : 'none' }}>
                <div className="result-header">
                    <h2>{t('fertilizer_recommendation_ready', 'Your Fertilizer Recommendation is Ready!')}</h2>
                    <p>{t('fertilizer_recommendation_desc', 'Based on your crop and soil nutrient values, here is your fertilizer recommendation.')}</p>
                </div>

                <div className="result-grid">
                    <div className="result-card recommended-crop">
                        <h3>
                            {t('crop', 'Crop')}: <span id="fertilizer-crop-name">{fertilizerData?.crop}</span>
                        </h3>

                        <div className="reason">
                            <h4>
                                <i className="fas fa-flask"></i>
                                {' '}{t('recommended_fertilizer', 'Recommended Fertilizer')}
                            </h4>

                            <div id="fertilizer-recommendations">
                                {fertilizerData?.recommendations?.overallRecommendation && (
                                    <p>
                                        <strong>{t('overall_recommendation', 'Overall Recommendation')}:</strong> {fertilizerData.recommendations.overallRecommendation}
                                    </p>
                                )}

                                {(fertilizerData?.recommendations?.recommendedFertilizers || []).map((recommendation, index) => (
                                    <div key={index} className="fertilizer-recommendation-item">
                                        <strong>{recommendation.nutrient}</strong>
                                        <p><strong>{t('fertilizer_label', 'Fertilizer')}:</strong> {recommendation.fertilizer}</p>
                                        <p><strong>{t('alternative_label', 'Alternative')}:</strong> {(recommendation.alternatives || []).join(', ')}</p>
                                        <p><strong>{t('why_label', 'Why')}:</strong> {recommendation.why}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="result-card">
                        <h4>
                            <i className="fas fa-seedling"></i>
                            {' '}{t('soil_status', 'Soil Status')}
                        </h4>

                        <ul id="fertilizer-soil-status">
                            {Object.entries(fertilizerData?.soilStatus || {}).map(([nutrient, status]) => (
                                <li key={nutrient}>
                                    <strong>{nutrient}:</strong> {status}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="result-card">
                        <h4>
                            <i className="fas fa-exclamation-circle"></i>
                            {' '}{t('nutrient_priority', 'Nutrient Priority')}
                        </h4>

                        <ul id="fertilizer-priority">
                            {Object.entries(fertilizerData?.priority || {}).map(([nutrient, value]) => (
                                <li key={nutrient}>
                                    <strong>{nutrient}:</strong> {value}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="result-card large-card">
                        <h4>
                            <i className="fas fa-brain"></i>
                            {' '}{t('why_recommendation', 'Why this recommendation?')}
                        </h4>

                        <ul id="fertilizer-xai">
                            {fertilizerData?.xaiExplanation && fertilizerData.xaiExplanation.length > 0 ? (
                                fertilizerData.xaiExplanation.map((explanation, index) => (
                                    <li key={index}>{explanation.trim()}</li>
                                ))
                            ) : (
                                <li>The recommendation is based on the crop requirement and soil nutrient status.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="actions">
                <Link to="/dashboard" className="btn">
                    <i className="fas fa-arrow-left"></i> {t('back_dashboard', 'Back to Dashboard')}
                </Link>
            </div>
        </main>
    );
};

export default Recommendation;