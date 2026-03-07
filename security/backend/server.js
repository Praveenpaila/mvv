const express = require("express");
const connectWatchmanDb = require("./config/watchmanDb");
const watchmanRoutes = require("./routes/watchmanRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5005;

app.use(cors());
app.use(bodyParser.json());

// Connect to Watchman DB
connectWatchmanDb();

// Watchman routes
app.use("/watchman", watchmanRoutes);

app.listen(PORT, () => {
  console.log(`Watchman backend running on port ${PORT}`);
});
