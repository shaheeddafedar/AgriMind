const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const PDFDocument = require('pdfkit');

// We don't need the MARKET_RATES list anymore because we trust the Database!

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        const recentRecs = await Recommendation.find({ userId: req.session.user._id }).sort({ createdAt: -1 }).limit(5);
        
        res.render('profile', {
            pageTitle: 'My Profile',
            user: user,
            recommendations: recentRecs,
            isLoggedIn: true
        });
    } catch (err) {
        console.log(err);
        res.redirect('/dashboard');
    }
};

exports.postUpdateProfile = async (req, res) => {
    try {
        const { name, location, email } = req.body;
        const updateData = { name, location, email };
        
        if (req.file) {
            updateData.profilePhoto = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(req.session.user._id, updateData, { new: true });
        req.session.user = updatedUser;
        res.redirect('/profile');
    } catch (err) {
        console.log(err);
        res.redirect('/profile');
    }
};

// --- THIS IS THE FUNCTION YOU ASKED FOR ---
exports.downloadSingleReport = async (req, res) => {
    try {
        const recId = req.params.id;
        
        // 1. Get Data from DB
        const rec = await Recommendation.findOne({ _id: recId, userId: req.session.user._id });
        const user = await User.findById(req.session.user._id);

        if (!rec) return res.redirect('/profile');

        // 2. Read Financials directly (with fallback to 0 if missing)
        const investment = rec.investment || 0;
        const grossRevenue = rec.grossRevenue || 0;
        const netProfit = rec.netProfit || 0;

        // 3. Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=AgriMind_Report_${rec.recommendedCrop}.pdf`);

        doc.pipe(res);

        // --- PDF DESIGN ---
        
        // Header
        doc.rect(0, 0, 612, 110).fill('#2E8B57'); 
        doc.fillColor('white').fontSize(26).text('AgriMind Report', 50, 40);
        doc.fontSize(12).text(`Report ID: ${rec._id.toString().substring(0, 8).toUpperCase()}`, 50, 75);
        doc.text(`Date: ${new Date(rec.createdAt).toLocaleDateString()}`, 400, 45, { align: 'right' });

        doc.moveDown(4);

        // Farmer Details
        doc.fillColor('black').fontSize(16).text(`Farmer: ${user.name}`, 50, 140);
        doc.fontSize(12).fillColor('#555').text(`Location: ${user.location}`);

        // Result Box
        doc.moveDown(2);
        doc.rect(50, 190, 510, 80).fillAndStroke('#f0fff4', '#2E8B57');
        doc.fillColor('#2E8B57').fontSize(12).text('Based on your inputs, the AI recommends:', 70, 210);
        doc.fontSize(24).font('Helvetica-Bold').text(rec.recommendedCrop.toUpperCase(), 70, 235);

        // --- FINANCIALS SECTION ---
        doc.moveDown(4);
        doc.fillColor('black').fontSize(16).font('Helvetica-Bold').text('Estimated Financials (Per Acre)', 50, 310);
        doc.rect(50, 330, 510, 2).fill('#eee');

        const finY = 350;

        doc.fontSize(12).font('Helvetica').fillColor('#555').text('Est. Investment:', 50, finY);
        doc.font('Helvetica-Bold').fillColor('#dc3545').text(`Rs. ${investment.toLocaleString()}`, 180, finY);

        doc.font('Helvetica').fillColor('#555').text('Gross Revenue:', 280, finY);
        doc.font('Helvetica-Bold').fillColor('#2E8B57').text(`Rs. ${grossRevenue.toLocaleString()}`, 400, finY);

        // Net Profit Badge
        doc.rect(50, finY + 30, 510, 40).fill('#e8f5e9'); 
        doc.fillColor('#1b5e20').fontSize(14).text(`NET PROFIT:  Rs. ${netProfit.toLocaleString()}`, 0, finY + 43, { align: 'center', width: 612 });

        // --- INPUTS SECTION (Reading from 'rec' object) ---
        doc.moveDown(4);
        doc.fillColor('black').fontSize(16).text('Your Soil & Weather Inputs', 50, 450);
        doc.rect(50, 470, 510, 2).fill('#2E8B57');

        const rowY = 490;
        doc.fontSize(12).font('Helvetica');

        // Column 1
        doc.fillColor('#555').text('Nitrogen (N):', 50, rowY);
        doc.fillColor('black').text(rec.nitrogen || 0, 150, rowY);

        doc.fillColor('#555').text('Phosphorus (P):', 50, rowY + 25);
        doc.fillColor('black').text(rec.phosphorus || 0, 150, rowY + 25);

        doc.fillColor('#555').text('Potassium (K):', 50, rowY + 50);
        doc.fillColor('black').text(rec.potassium || 0, 150, rowY + 50);

        // Column 2
        doc.fillColor('#555').text('Soil pH:', 300, rowY);
        doc.fillColor('black').text(rec.soilPh || 0, 400, rowY);

        doc.fillColor('#555').text('Rainfall:', 300, rowY + 25);
        doc.fillColor('black').text(`${rec.rainfall || 0} mm`, 400, rowY + 25);

        doc.fillColor('#555').text('Temperature:', 300, rowY + 50);
        doc.fillColor('black').text(rec.temperature ? `${rec.temperature}°C` : 'N/A', 400, rowY + 50);

        doc.end();

    } catch (err) {
        console.log("PDF Generation Error:", err);
        res.redirect('/profile');
    }
};