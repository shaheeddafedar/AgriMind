const express = require('express');
const router = express.Router();
const multer = require('multer');

const pageController = require('../controllers/pageController');
const authController = require('../controllers/authcontroller'); 
const userController = require('../controllers/userController'); 

const isAuth = require('../middleware/isAuth');
const upload = require('../middleware/uploads'); 

router.get('/lang/:locale', (req, res) => {
    const locale = req.params.locale;
    res.cookie('lang', locale, { maxAge: 900000, httpOnly: true });
    res.redirect(req.get('Referer') || '/'); 
});

router.get('/', pageController.getHomepage);
router.get('/about', pageController.getAbout);
router.get('/analytics', pageController.getAnalytics);

router.get('/dashboard', isAuth, pageController.getDashboard);
router.get('/feedback', isAuth, pageController.getFeedback);
router.get('/recommend', isAuth, pageController.getRecommendationPage);
router.get('/irrigation', isAuth, (req, res) => {
    res.render('smart-irrigation', {
        userId: req.session.user._id
    });
});

router.get('/profile', isAuth, (req, res) => {
    userController.getProfile(req, res);
});

router.post('/profile/update', isAuth, upload.single('profilePhoto'), (req, res) => {
    userController.postUpdateProfile(req, res);
});

router.post('/signup', upload.single('profilePhoto'), authController.postSignup);

// router.get('/download-report', isAuth, (req, res) => {
//     userController.downloadReport(req, res);
// });


router.get('/recommendation/pdf/:id', isAuth, (req, res) => {
    userController.downloadSingleReport(req, res);
});

router.post('/signup', (req, res, next) => {
    upload.single('profilePhoto')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            
            req.flash('error', 'File too large! Max limit is 5MB.');
            return res.redirect('/signup');
        } else if (err) {
            req.flash('error', err);
            return res.redirect('/signup');
        }
        authController.postSignup(req, res, next);
    });
});

module.exports = router;