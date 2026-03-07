const Watchman = require("../model/watchman");
const bcrypt = require("bcryptjs");
const { pr } = require("../../deliveryImages/delivery");

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
  // Simulate QR scan lookup
  const { qrValue } = req.body;
  const db = {
    DELIV12003: { name: "Ravi Kumar", image: "/delivery/ravi.jpg" },
    DELIV456: { name: "Priya Singh", image: "/delivery/priya.jpg" },
    2023000629: { name: "praveen", image: "/deliveryImages/PR.png" },
  };
  const person = db[qrValue] || null;
  if (person) {
    res.json(person);
  } else {
    res.status(404).json({ error: "No delivery person found for this QR." });
  }
};
