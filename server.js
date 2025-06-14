const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const User = require('./models/user');    
const jwt = require("jsonwebtoken");
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();


// Configuration
const config = {
    port: 3000,
    env: 'development',
    sessionSecret: 'smartronix-secure-session-key-2024',
    mongoUri: 'mongodb+srv://Smartronix:Smartronix.DB1@cluster74.qi8xpgn.mongodb.net/smartronics?retryWrites=true&w=majority&appName=Cluster74'
};

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(cors());
app.use(compression());



// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: config.env === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Logging
if (config.env === 'development') {
    app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use EJS layouts
app.use(expressLayouts);
app.set('layout', false); // Set default layout to false
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Import routes
const homeRoutes = require('./routes/home');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const contactRoutes = require('./routes/contact');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

app.use(async (req, res, next) => {
    try {
      const token = req.cookies.token;
  
      if (!token) {
        res.locals.user = null;
        return next();
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET_PHRASE);
      const user = await User.findById(decoded.id);
  
      res.locals.user = user || null;
      next();
    } catch (error) {
      console.error("JWT middleware error:", error);
      res.locals.user = null;
      return next();
    }
});

// Use routes
app.use('/', homeRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/contact', contactRoutes);
app.use('/api/user', userRoutes);
app.use('/admin', adminRoutes);

// Set path for all routes
app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

app.get("/login" , (req,res)=>{
    res.render("pages/login", { layout: false })
})
app.get("/signup" , (req,res)=>{
    res.render("pages/signup", { layout: false })
})

// Add a /profile route for all users
app.get('/profile', (req, res) => {
    res.render('pages/profile', {
        title: 'Profile',
        user: res.locals.user,
        layout: 'layouts/admin'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/error', {
        message: 'Something went wrong!',
        error: config.env === 'development' ? err : {},
        layout: false
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('pages/error', {
        message: 'Page not found',
        error: {},
        layout: false
    });
});

app.listen(config.port, () => {
    console.log(`Server is running in ${config.env} mode on port ${config.port}`);
});
