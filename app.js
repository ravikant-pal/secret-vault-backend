const express = require("express");
var cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv/config");
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import Routes
const usersRoute = require("./routes/users");
const keysRoute = require("./routes/keys");
const valuesRoute = require("./routes/values");

app.use("/users", usersRoute);
app.use("/keys", keysRoute);
app.use("/values", valuesRoute);
app.get("/", async (req, res) => {
  res.send("we are on home");
});

// connect to db
mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    console.log("connected to DB");
  })
  .catch((error) => {
    console.log("No connection", error);
  });

app.listen(3001);

// mongo db atlas crad
// email => rorehe8611@ovout.com
// password => w4J3ndDLLYmaH8w
