import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import '../assets/css/analytics.css';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

import { Pie, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Analytics = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data.');
      }
    };

    fetchAnalytics();
  }, []);

  if (!data && !error) {
    return (
      <main className="page-content">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          {' '}{t('loading', 'Loading...')}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-content">
        <div className="container">
          <div className="error-message">
            {error}
          </div>
        </div>
      </main>
    );
  }

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

  const formatCropName = (crop) => {
    if (!crop) return '';
    return crop
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // 1. Most Recommended Crops (Doughnut)
  const cropCounts = (data.mostRecommendedCrops || []).map((item) => item.count);
  const cropsData = {
    labels: (data.mostRecommendedCrops || []).map((item) => formatCropName(item._id)),
    datasets: [
      {
        data: cropCounts,
        backgroundColor: cropCounts.map((_, index) => cropColors[index % cropColors.length]),
        borderWidth: 1
      }
    ]
  };

  const cropsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  // 2. Recommendations by Season (Pie)
  const seasonLabels = (data.recommendationsBySeason || []).map((item) => item._id);
  const seasonCounts = (data.recommendationsBySeason || []).map((item) => item.count);
  const seasonData = {
    labels: seasonLabels,
    datasets: [
      {
        data: seasonCounts,
        backgroundColor: seasonLabels.map((season) => seasonColors[season] || '#81C784'),
        borderWidth: 1
      }
    ]
  };

  const seasonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  // 3. Fertilizer Analysis (Bar)
  const fertilizerLabels = (data.fertilizerAnalysis || []).map((item) => item._id);
  const fertilizerCounts = (data.fertilizerAnalysis || []).map((item) => item.count);
  const fertilizerDataChart = {
    labels: fertilizerLabels,
    datasets: [
      {
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
      }
    ]
  };

  const fertilizerOptions = {
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
  };

  // 4. NPK Nutrient Analysis (Bar)
  const npkData = {
    labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
    datasets: [
      {
        label: 'Low',
        data: [
          data.npkAnalysis?.nitrogen?.low || 0,
          data.npkAnalysis?.phosphorus?.low || 0,
          data.npkAnalysis?.potassium?.low || 0
        ],
        backgroundColor: '#EF6C00'
      },
      {
        label: 'Medium',
        data: [
          data.npkAnalysis?.nitrogen?.medium || 0,
          data.npkAnalysis?.phosphorus?.medium || 0,
          data.npkAnalysis?.potassium?.medium || 0
        ],
        backgroundColor: '#FFA726'
      },
      {
        label: 'High',
        data: [
          data.npkAnalysis?.nitrogen?.high || 0,
          data.npkAnalysis?.phosphorus?.high || 0,
          data.npkAnalysis?.potassium?.high || 0
        ],
        backgroundColor: '#43A047'
      }
    ]
  };

  const npkOptions = {
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
  };

  return (
    <main className="page-content">
      {/* ================= FULL WIDTH HEADER ================= */}
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <h1>
              <i className="fas fa-chart-line"></i>
              {' '}{t('analytics_title', 'AgriMind Analytics')}
            </h1>
            <p>
              {t('analytics_desc', 'Explore insights from crop recommendations, seasonal trends, and farmer engagement across the AgriMind platform.')}
            </p>
          </div>
        </div>
      </div>

      {/* ================= ANALYTICS CONTENT ================= */}
      <div className="container analytics-content">
        <div className="analytics-grid">
          {/* ================= MOST RECOMMENDED CROPS ================= */}
          <div className="chart-container">
            <h3>{t('analytics_crops', 'Most Recommended Crops')}</h3>
            <div style={{ height: '350px' }}>
              <Doughnut data={cropsData} options={cropsOptions} />
            </div>
          </div>

          {/* ================= RECOMMENDATIONS BY SEASON ================= */}
          <div className="chart-container">
            <h3>{t('analytics_season', 'Recommendations by Season')}</h3>
            <div style={{ height: '350px' }}>
              <Pie data={seasonData} options={seasonOptions} />
            </div>
          </div>

          {/* ================= FERTILIZER ANALYSIS ================= */}
          <div className="chart-container">
            <h3>{t('analytics_fertilizer', 'Fertilizer Analysis')}</h3>
            <div style={{ height: '350px' }}>
              <Bar data={fertilizerDataChart} options={fertilizerOptions} />
            </div>
          </div>

          {/* ================= NPK ANALYSIS ================= */}
          <div className="chart-container">
            <h3>{t('analytics_npk', 'NPK Nutrient Analysis')}</h3>
            <div style={{ height: '350px' }}>
              <Bar data={npkData} options={npkOptions} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Analytics;