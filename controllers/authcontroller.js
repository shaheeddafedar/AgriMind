const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getSignupPage = (req, res, next) => {
    res.render('signup', {
        pageTitle: 'Sign Up',
    });
};

exports.postSignup = async (req, res, next) => {
    const { name, phone, email, password, location } = req.body;

    if (!password) {
        req.flash('error', 'Password is required.');
        return res.redirect('/signup');
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            req.flash('error', 'Email already exists. Please log in.');
            return res.redirect('/signup');
        }

        const profilePhoto = req.file ? `/uploads/${req.file.filename}` : '/images/default-user.png';
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            phone,
            email,
            password: hashedPassword,
            location: location || 'India',
            profilePhoto
        });

        await user.save();
        console.log('User Registered:', email);        
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
            if (err) console.log('Session Error:', err);
            
            res.redirect('/dashboard'); 
        });


    } catch (err) {
        console.error("Signup Error:", err);
        req.flash('error', 'Signup failed. Please try again.');
        res.redirect('/signup');
    }
};
exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user; 
            
            req.session.save(err => {
                if(err) console.log(err);
                res.redirect('/dashboard');
            });
        } else {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) console.log(err);
        res.redirect('/');
    });
};