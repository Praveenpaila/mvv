const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

const UserModel = require("../model/mkUser");
const DeliveryPerson = require("../model/mkDeliveryPerson");
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

    let user = await UserModel.findOne({ email });
    let isWatchman = false;

    if (!user) {
      // Try Watchman (security) login by email — same login screen, no separate watchman entry
      try {
        const Watchman = require("../model/watchman");
        const watchman = await Watchman.findOne({
          email: email.toLowerCase().trim(),
        });
        if (watchman) {
          const match = await bcryptjs.compare(password, watchman.password);
          if (match) {
            isWatchman = true;
            user = {
              _id: watchman._id,
              email: watchman.email,
              userName: watchman.username || watchman.email,
              phoneNumber: "",
              role: watchman.role || "security",
            };
          }
        }
      } catch (e) {
        // Watchman DB not available or error — fall through to "email doesn't exist"
      }
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Email doesn't exist, please signup",
        });
      }
    } else {
      const checkPassword = await bcryptjs.compare(password, user.password);
      if (!checkPassword) {
        return res.status(400).json({
          success: false,
          message: "Invalid password",
        });
      }
    }

    // Auto-create delivery person entry if role is deliveryPerson (only for mkUser)
    if (!isWatchman && user.role === "deliveryPerson") {
      let deliveryPerson = await DeliveryPerson.findOne({ userId: user._id });
      if (!deliveryPerson) {
        // Create delivery person entry automatically
        deliveryPerson = await DeliveryPerson.create({
          userId: user._id,
          name: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          vehicleNumber: "",
          isActive: true,
        });
      }
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName ?? user.username,
        phoneNumber: user.phoneNumber ?? "",
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

exports.authorize = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      const matched = await bcryptjs.compare(password, user.password);
      if (matched) {
        await UserModel.findByIdAndUpdate(user._id, { role });
        return res.status(200).json({
          success: true,
          message: "role successfully updated",
        });
      }
      return res.status(401).json({
        success: false,
        message: "invalid password",
      });
    }
    return res.status(404).json({
      success: false,
      message: "User Does not exist",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err || "Error occured while authorizing the person",
    });
  }
};
