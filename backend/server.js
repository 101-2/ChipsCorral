const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
var colors = require("colors");

require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const salt = 10;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// initialize express
const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();

// initialize express body-parsing for error logging
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

pool.on("connect", () => {
  console.log("connected to database".magenta);
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

app.get("/test", (req, res) => {
  pool.connect().then(client => {
    return client
      .query("SELECT * FROM users;")
      .then(res => {
        client.release();
        console.log(res.rows);
      })
      .catch(err => {
        client.release();
        console.log(err.stack);
      });
  });
});

app.put("/user/:user_info", (req, res) => {
  const user_info = JSON.parse(req.params.user_info);
  console.log(`Attempting to create user ${user_info.username}`);

  bcrypt
    .hash(user_info.password, salt)
    .then(hash => {
      var query =
        "INSERT INTO users(email, password, username) VALUES ('" +
        user_info.email +
        "', '" +
        hash +
        "', '" +
        user_info.username +
        "');";

      console.log(query.yellow);
      pool.connect().then(client => {
        return client
          .query(query)
          .then(data => {
            client.release();
            console.log(data);
            res.status(200);
            res.send(`User ${user_info.username} created`);
          })
          .catch(err => {
            client.release();
            console.log(err.stack);
            res.status(400);
            res.send("Error creating user");
          });
      });
    })
    .catch(err => {
      res.status(400);
      res.send("Error Hashing");
      console.log(err);
    });
});

// start server
app.listen(PORT, () => console.log(`listening on port ${PORT}`.magenta));
