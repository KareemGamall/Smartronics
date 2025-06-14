const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/user");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory:', uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user._id : (res.locals.user ? res.locals.user._id : Date.now());
        const ext = path.extname(file.originalname);
        cb(null, `${userId}_profile${ext}`);
    }
});

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).render('pages/error', {
            message: 'File upload error: ' + err.message,
            error: {},
            layout: 'layouts/admin'
        });
    } else if (err) {
        console.error('Upload error:', err);
        return res.status(500).render('pages/error', {
            message: 'Error uploading file',
            error: {},
            layout: 'layouts/admin'
        });
    }
    next();
};

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", (req,res) => {
    res.clearCookie("token");
    res.redirect("/");
});

// Profile page
router.get('/profile', (req, res) => {
    res.render('pages/profile', {
        title: 'Profile',
        user: res.locals.user,
        edit: req.query.edit === '1',
        layout: 'layouts/admin'
    });
});

// Profile update route with error handling
router.post('/profile', upload.single('photo'), handleMulterError, async (req, res) => {
    try {
        console.log('Profile update request received:', {
            body: req.body,
            file: req.file,
            user: req.user || res.locals.user
        });

        const userId = req.user ? req.user._id : res.locals.user._id;
        if (!userId) {
            console.error('No user ID found in request');
            return res.status(401).render('pages/error', {
                message: 'User not authenticated',
                error: {},
                layout: 'layouts/admin'
            });
        }

        const update = { name: req.body.name };
        if (req.file) {
            console.log('File uploaded successfully:', req.file);
            // Store the relative path to the file
            update.photoUrl = '/uploads/' + req.file.filename;
        }

        console.log('Updating user with data:', update);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            update,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            console.error('User not found for ID:', userId);
            return res.status(404).render('pages/error', {
                message: 'User not found',
                error: {},
                layout: 'layouts/admin'
            });
        }

        console.log('Profile updated successfully:', updatedUser);
        res.redirect('/api/user/profile');
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).render('pages/error', {
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error : {},
            layout: 'layouts/admin'
        });
    }
});

module.exports = router;
