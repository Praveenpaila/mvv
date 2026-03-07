const Watchman = require("../model/watchman");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const watchman = new Watchman({ username, password: hashedPassword });
    await watchman.save();
    res.status(201).json({ message: "Watchman registered successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
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
  };
  const person = db[qrValue] || null;
  if (person) {
    res.json(person);
  } else {
    res.status(404).json({ error: "No delivery person found for this QR." });
  }
};
