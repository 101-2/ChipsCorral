const express = require("express");
const session = require("express-session");
const nunjucks = require("nunjucks");
const cors = require("cors");
// const okta = require("@okta/okta-sdk-nodejs");
// const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
const passport = require("passport");
const OidcStrategy = require("passport-openidconnect").Strategy;

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

// initialize express body-parsing for error logging
app.options("*", cors());
app.use(express.static(__dirname + "/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "alskd;oinowioiaon'iasdij14098pugno;isdfhasdjkhlas",
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  "oidc",
  new OidcStrategy(
    {
      issuer: "https://dev-882471.okta.com/oauth2/default",
      authorizationURL:
        "https://dev-882471.okta.com/oauth2/default/v1/authorize",
      tokenURL: "https://dev-882471.okta.com/oauth2/default/v1/token",
      userInfoURL: "https://dev-882471.okta.com/oauth2/default/v1/userinfo",
      clientID: "0oahqwjwkAqyibi8V356",
      clientSecret: "BNH9ynOKGO5A7uya90-8K4vuToTYNiXUpPihSxkw",
      callbackURL:
        "https://cub-forum.herokuapp.com/authorization-code/callback",
      scope: "openid profile",
      routes: {
        login: {
          path: "/users/login"
        },
        callback: {
          path: "/authorization-code/callback",
          defaultRedirect: "/home"
        }
      }
    },
    (issuer, sub, profile, accessToken, refreshToken, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, next) => {
  next(null, user);
});

passport.deserializeUser((obj, next) => {
  next(null, obj);
});

// var oktaClient = new okta.Client({
//   orgUrl: "https://dev-882471.okta.com",
//   token: "00hK2PSWor0vUzqaLcqRYwhIy6EQ-KWH7Q5kZSID9c"
// });

// const oidc = new ExpressOIDC({
//   issuer: "https://dev-882471.okta.com/oauth2/default",
//   client_id: "0oahqwjwkAqyibi8V356",
//   client_secret: "BNH9ynOKGO5A7uya90-8K4vuToTYNiXUpPihSxkw",
//   redirect_uri: "https://cub-forum.herokuapp.com/authorization-code/callback",
//   scope: "openid profile",
//   routes: {
//     login: {
//       path: "/users/login"
//     },
//     callback: {
//       path: "/authorization-code/callback",
//       defaultRedirect: "/home"
//     }
//   }
// });

// app.use(oidc.router);

app.use(async (req, res, next) => {
  if (req.userinfo) {
    try {
      req.user = await oktaClient.getUser(req.userinfo.sub);
    } catch (err) {
      console.log(err);
    }
  }

  next();
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

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

app.use("/", welcomeRouter);
app.use("/home", ensureLoggedIn, homeRouter);
app.use("/users", usersRouter);
app.use("/users/login", passport.authenticate("oidc"));
app.use(
  "/authorization-code/callback",
  passport.authenticate("oidc", { failureRedirect: "/error" }),
  (req, res) => {
    res.redirect("/home");
  }
);

app.use("/profile", (req, res) => {
  res.json({ profile: req.user });
});

// create post
app.post("/post", (req, res) => {
  const post_info = req.body;
  db.none(
    "INSERT INTO posts(title, content, user_id, thread_id) VALUES($1, $2, $3, $4);",
    [post_info.title, post_info.content, req.user.id, post_info.thread_id]
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

app.get("/posts", (req, res) => {
  db.any("SELECT * FROM posts ORDER BY post_id DESC;")
    .then(data => {
      res.status(200);
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.status(400);
      res.send(err);
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

app.listen(process.env.PORT || 5000, () => {
  console.log(`listening on port ${process.env.PORT || 5000}`);
});
