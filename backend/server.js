const express = require("express");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();
var colors = require("colors");

require("dotenv").config();
const pgp = require("pg-promise")();
const bcrypt = require("bcrypt");
const salt = 10;

const db = pgp(process.env.DATABASE_URL);

// initialize express
const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();

// initialize express body-parsing for error logging
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get("/test", (req, res) => {
  db.any("SELECT * FROM USERS;")
    .then(data => {
      console.log(data);
      res.status(200);
      res.send("Test passed");
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send("Test failed");
    });
});

app.put("/user/:user_info", (req, res) => {
  const user_info = JSON.parse(req.params.user_info);
  console.log(`Attempting to create user ${user_info.username}`);

  bcrypt.hash(user_info.password, salt).then(hash => {
    var query =
      "INSERT INTO users(email, password, username) VALUES ('" +
      user_info.email +
      "', '" +
      hash +
      "', '" +
      user_info.username +
      "');";

    console.log(query.yellow);

    db.any(query)
      .then(data => {
        console.log(data);
        res.status(201);
        res.send(`User ${user_info.username} created.`);
      })
      .catch(err => {
        console.log(err);
        res.status(400);
        res.send("Error creating user.");
      });
  });
});

// start server
app.listen(PORT, () => console.log(`listening on port ${PORT}`.magenta));
