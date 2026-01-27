const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

const UserModel = require("../model/mkUser");
const accessKey = process.env.KEY;

/* ================= TOKEN ================= */
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, accessKey, { expiresIn: "10h" });
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter all the details",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email doesn't exist, please signup",
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while login",
    });
  }
};

/* ================= SIGNUP ================= */
exports.signup = async (req, res) => {
  try {
    const { email, password, userName, phoneNumber } = req.body;

    if (!email || !password || !userName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Enter all the details",
      });
    }

    const userNameExists = await UserModel.findOne({ userName });
    if (userNameExists) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const phoneExists = await UserModel.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists, please login",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
      userName,
      phoneNumber,
      role: "user", // ✅ explicit
    });

    const token = generateToken(newUser._id, newUser.role);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        userName: newUser.userName,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while signup",
    });
  }
};
