const Watchman = require("../model/watchman");
const bcrypt = require("bcryptjs");
const DeliveryPerson = require("../model/mkDeliveryPerson");
const mongoose = require("mongoose");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const watchman = new Watchman({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });
    await watchman.save();
    res.status(201).json({ message: "Watchman registered successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(401)
        .json({ error: "Username and password are required." });
    }
    const watchman = await Watchman.findOne({ username });
    if (!watchman)
      return res.status(401).json({ error: "Invalid credentials." });
    const match = await bcrypt.compare(password, watchman.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials." });
    res.json({ message: "Login successful.", role: watchman.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.scanQR = async (req, res) => {
  try {
    const qrValue = String(req.body?.qrValue || "").trim();
    if (!qrValue) {
      return res.status(400).json({ error: "qrValue is required." });
    }

    // Accept phone number scans (most common)
    const normalizedPhone = qrValue.replace(/[^\d+]/g, "");

    let person = await DeliveryPerson.findOne({
      $or: [
        { phoneNumber: normalizedPhone },
        { phoneNumber: qrValue },
        ...(mongoose.isValidObjectId(qrValue) ? [{ _id: qrValue }] : []),
      ],
      isActive: true,
    }).select("name email phoneNumber");

    if (!person) {
      return res.status(404).json({ error: "No delivery person found for this QR." });
    }

    return res.json({
      name: person.name,
      email: person.email,
      phoneNumber: person.phoneNumber,
      image: null,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
