const express = require("express");
var cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const coockieParser = require("cookie-parser");
const verifyJWT = require("./middleware/verifyJWT");
// Import Routes
const usersRoute = require("./routes/users");
const keysRoute = require("./routes/keys");
const valuesRoute = require("./routes/values");
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");
require("dotenv/config");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(credentials);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(coockieParser());

app.use("/users", usersRoute);
app.get("/", async (req, res) => {
  res.send({ message: "This is the testing route 🧪🧪" });
});
app.use(verifyJWT);
app.use("/keys", keysRoute);
app.use("/values", valuesRoute);

// connect to db
mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    console.log("connected to DB");
  })
  .catch((error) => {
    console.log("No connection", error);
  });

app.listen(PORT, () => {
  console.info("App is running on :", PORT);
});
