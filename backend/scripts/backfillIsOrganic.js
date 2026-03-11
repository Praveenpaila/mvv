const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Product = require("../model/mkProduct");

const MongoURL = process.env.MONGO_URL;

if (!MongoURL) {
  console.error("Error: MONGO_URL is not defined in environment variables");
  process.exit(1);
}

const markByName = process.argv.includes("--mark-by-name");

async function run() {
  await mongoose.connect(MongoURL);

  const missing = await Product.updateMany(
    { isOrganic: { $exists: false } },
    { $set: { isOrganic: false } },
  );

  let marked = { matchedCount: 0, modifiedCount: 0 };
  if (markByName) {
    marked = await Product.updateMany(
      { name: /organic/i },
      { $set: { isOrganic: true } },
    );
  }

  console.log(
    JSON.stringify(
      {
        updatedMissing: {
          matched: missing.matchedCount || missing.n,
          modified: missing.modifiedCount || missing.nModified,
        },
        markedByName: markByName
          ? {
              matched: marked.matchedCount || marked.n,
              modified: marked.modifiedCount || marked.nModified,
            }
          : null,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
