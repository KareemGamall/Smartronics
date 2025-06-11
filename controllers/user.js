const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }

    const existingPhoneNumber = await User.findOne({ phoneNumber });
    if (existingPhoneNumber) {
      return res.status(400).json({
        error: "Phone number is taken",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    user.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Wrong email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Wrong email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_PHRASE,
      {
        expiresIn: "30d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error in login",
    });
  }
};
