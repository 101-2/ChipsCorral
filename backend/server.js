const express = require("express");
const pino = require("express-pino-logger")();
const cors = require("cors");
var colors = require("colors");

require("dotenv").config();
const pgp = require("pg-promise")();
const bcrypt = require("bcrypt");
const salt = 10;

const db = pgp(process.env.DATABASE_URL);

// initialize express
const PORT = process.env.PORT || 5000;
const app = express();

// initialize express body-parsing for error logging
app.options("*", cors());
app.use(pino);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// get request for /
app.get("/", (req, res) => {
  res.send("Hello from CUB-FORUM-API");
});

// test get functions for database
app.get("/test", (req, res) => {
  db.any("SELECT * FROM USERS;")
    .then(data => {
      res.status(200);
      res.send("Test passed: " + JSON.stringify(data));
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send("Test failed");
    });
});

// creating user
app.post("/user", (req, res) => {
  console.log(req.body.email);
  const user_info = req.body;
  console.log(`Attempting to create user ${user_info.username}`);

  if (user_info.password === undefined) {
    console.log("PASSWORD UNDEFINED");
    res.status(400);
    res.send("PASSWORD UNDEFINED");
    return;
  }

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

// delete user
app.delete("/user", (req, res) => {
  console.log(req.query.id);
  var query = `DELETE FROM users WHERE user_id=${req.query.id}`;
  db.any(query)
    .then(data => {
      console.log(data);
      res.status(200);
      res.send("User deleted");
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send("User could not be deleted");
    });
});

// get user info
app.get("/user", (req, res) => {
  console.log(req.query.id);
  var query = `SELECT * FROM users WHERE user_id=${req.query.id} LIMIT 1`;
  db.any(query)
    .then(data => {
      console.log(data);
      res.status(200);
      if (typeof data[0] === undefined || data.length == 0) {
        throw `data undefined for user_id: ${req.query.id}`;
      } else {
        res.send(`User ${data[0].username} data retrieved`);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send(`User ${req.query.id} could not be retrieved`);
    });
});

// start server
app.listen(PORT, () => console.log(`listening on port ${PORT}`.magenta));
