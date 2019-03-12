const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const User = require("./models/user");

const PORT = 3001;
const app = express();
const router = express.Router();

// initialize express body-parsing for error logging
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

// database connect link
const dbConnect =
  "mongodb+srv://chip:skobuffs@chipscorral-v85sn.mongodb.net/test?retryWrites=true";

mongoose.connect(dbConnect, {
  useNewUrlParser: true
});

// connect to database or throw error
let db = mongoose.connection;
db.once("open", () => console.log("connected to the database"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// start server
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
