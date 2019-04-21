const express = require("express");
const session = require("express-session");
const nunjucks = require("nunjucks");
const cors = require("cors");
const okta = require("@okta/okta-sdk-nodejs");
const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

const welcomeRouter = require("./routes/welcome");
const homeRouter = require("./routes/home");
const usersRouter = require("./routes/users");

require("dotenv").config();
const pgp = require("pg-promise")();
const bcrypt = require("bcrypt");
const salt = 10;

const db = pgp(process.env.DATABASE_URL);

// initialize express
const app = express();

var oktaClient = new okta.Client({
  orgUrl: "https://dev-882471.okta.com",
  token: "00f4VNjzeOiLW7z45xOZUW2CkUwcsp0kQ_ztnF7tvq"
});

const oidc = new ExpressOIDC({
  issuer: "https://dev-882471.okta.com/oauth2/default",
  client_id: "0oahqt0dfGtGYhUf7356",
  client_secret: "jPYoPT2eDW3hOp9vILPa9BcHU725_sEaAGZY1z1w",
  redirect_uri: "https://cub-forum.herokuapp.com/authorization-code/callback",
  scope: "openid profile"
});

// initialize express body-parsing for error logging
app.options("*", cors());
app.use(express.static(__dirname + "/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "alskd;oinowioiaon'iasdij14098pugno;isdfhasdjkhlas",
    resave: true,
    saveUninitialized: false
  })
);
app.use(oidc.router);
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient
    .getUser(req.userinfo.sub)
    .then(user => {
      res.user = user;
      res.locals.user = user;
      next();
    })
    .catch(err => {
      next(err);
    });
});
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
app.use(cors());

nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.set("view engine", "html");

app.use("/", welcomeRouter);
app.use("/home", oidc.ensureAuthenticated(), usersRouter);
app.use("/users", usersRouter);

app.get("/test", (req, res) => {
  res.json({ profile: req.user ? req.user.profile : null });
});

// get request for /
// app.get("/", (req, res) => {
//   res.render("pages/welcome.html");
// });

// app.get("/signup", (req, res) => {
//   res.render("pages/signup.html");
// });

// app.get("/login", (req, res) => {
//   res.render("pages/login.html");
// });

// app.get("/home", (req, res) => {
//   res.render("pages/home.html");
// });

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
    db.one("SELECT * FROM users WHERE email = $1 OR username = $2;", [
      user_info.email,
      user_info.username
    ])
      .then(data => {
        console.log(data);
        res.status(400);
        if (
          data.email == user_info.email &&
          data.username == user_info.username
        ) {
          console.log(
            `User with email: ${user_info.email} and with username: ${
              user_info.username
            } already exists`
          );
          res.json({
            dev: `User with email: ${user_info.email} and with username: ${
              user_info.username
            } already exists`,
            message: "Username and email taken"
          });
        } else if (data.username == user_info.username) {
          console.log(
            `User with username: ${user_info.username} already exists`
          );
          res.json({
            dev: `User with username: ${user_info.username} already exists`,
            message: "Username taken"
          });
        } else {
          console.log(`User with email: ${user_info.email} already exists`);
          res.json({
            dev: `User with email: ${user_info.email} already exists`,
            message: "Email taken"
          });
        }
      })
      .catch(err => {
        console.log("Matching Users: " + err.received);
        if (err.received == 0) {
          db.any(
            "INSERT INTO users(email, password, username) VALUES ($1, $2, $3);",
            [user_info.email, hash, user_info.username]
          )
            .then(data => {
              console.log("SERVER SUCCESS");
              res.status(201);
              res.send("Success: " + user_info);
            })
            .catch(err => {
              console.error("SERVER ERROR: ", err);
              res.status(400);
              res.send({ err });
            });
        }
      });
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
        res.send(data[0]);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send({ err });
    });
});

// delete user
app.delete("/user", (req, res) => {
  console.log(req.query.id);
  db.any("SELECT * FROM users WHERE user_id=$1", [req.query.id])
    .then(data => {
      console.log(data);
      if (data !== undefined) {
        db.any("DELETE FROM users WHERE user_id=$1", [req.query.id])
          .then(data => {
            console.log(data);
            res.status(200);
            res.send(`User with id ${req.query.id} deleted`);
          })
          .catch(err => {
            console.log(err);
            res.status(400);
            res.send("User could not be deleted");
          });
      } else {
        throw `User with id ${req.query.id} does not exist`;
      }
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send({ err });
    });
});

// create post
app.post("/post", (req, res) => {
  const post_info = req.body;
  db.none(
    "INSERT INTO posts(title, content, user_id, thread_id) VALUES($1, $2, $3, $4);",
    [post_info.title, post_info.content, post_info.user_id, post_info.thread_id]
  )
    .then(data => {
      res.status(200);
      res.json({
        status: "Post successful"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.json({
        status: "Post could not be created",
        error: err
      });
    });
});

// get post
app.get("/post", (req, res) => {
  db.one("SELECT * FROM posts WHERE post_id=$1;", [req.query.id])
    .then(data => {
      console.log(data);
      res.status(200);
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.json({
        message: `Post with id: ${req.query.id} does not exist`
      });
    });
});

// delete post
app.delete("/post", (req, res) => {
  db.one("SELECT * FROM posts WHERE post_id=$1;", [req.query.id])
    .then(data => {
      db.none("DELETE FROM posts WHERE post_id=$1;", [req.query.id])
        .then(() => {
          res.status(200);
          res.json({
            dev: `Post with id: ${req.query.id} deleted`,
            message: "Post deleted",
            status: "Success"
          });
        })
        .catch(err => {
          console.log(err);
          res.status(400);
          res.send({ err });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send({ err });
    });
});

// start server
oidc.on("ready", () => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`listening on port ${process.env.PORT || 5000}`);
  });
});

oidc.on("error", err => {
  console.log("Unable to configure ExpressOIDC", err);
});
