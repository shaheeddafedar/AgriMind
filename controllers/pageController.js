const Recommendation = require('../models/Recommendation');
const Feedback = require('../models/Feedback');
const User = require('../models/User'); // Ensure this line is added

exports.getHomepage = async (req, res, next) => {
    try {
        const cropsRecommended = await Recommendation.countDocuments();
        const farmersHelped = await User.countDocuments(); // Ensure this line is changed

        res.render('index', {
            pageTitle: 'Home',
            stats: {
                farmers: farmersHelped,
                crops: cropsRecommended,
                accuracy: 95
            }
        });
    } catch (err) {
        res.render('index',
            {
                pageTitle: 'Home',
                stats: {
                    farmers: 100,
                    crops: 50,
                    accuracy: 95
                }
            });
    }
};
exports.getDashboard = (req, res, next) => {
    res.render('dashboard', {
        pageTitle: 'Dashboard',
        userId: req.session.user ? req.session.user._id : null
    });
};

exports.getAnalytics = (req, res, next) => {
    res.render('analytics', 
    { pageTitle: 'Analytics' 
});
};

exports.getFeedback = async (req, res, next) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(6);
        res.render('feedback', 
        { 
            pageTitle: 'Feedback', 
            feedbacks: feedbacks,
            userId: req.session.user ? req.session.user._id : null
     });
    } catch (err) {
        res.render('feedback', 
    { 
        pageTitle: 'Feedback', 
        feedbacks: [],
        userId: req.session.user ? req.session.user._id : null
});
    }
};

exports.getAbout = (req, res, next) => {
    res.render('about', 
        { pageTitle: 'About' 
});
};

exports.getRecommendationPage = (req, res, next) => {
    res.render('recommend', { 
        pageTitle: 'Your Recommendation',
        userId: req.session.user ? req.session.user._id : null
    });
};