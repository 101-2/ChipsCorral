const express = require("express");
const session = require("express-session");
const nunjucks = require("nunjucks");
const cors = require("cors");
const okta = require("@okta/okta-sdk-nodejs");
const passport = require("passport");
// const OidcStrategy = require("passport-openidconnect").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

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
  new GoogleStrategy(
    {
      clientID:
        "427987254229-nrij2h066k5e92rgrr8vrb6cht0h6hl4.apps.googleusercontent.com",
      clientSecret: "LZGtPGlT5cHAmxTdMiRAToSf",
      callbackURL: "https://cub-forum.herokuapp.com/auth/google/callback"
    },
    (token, tokenSecret, profile, done) => {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, next) => {
  next(null, user);
});

passport.deserializeUser((obj, next) => {
  next(null, obj);
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"]
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log(req.user);
    res.redirect("/home");
  }
);

app.use(cors());

nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.set("view engine", "html");

function ensureLoggedIn(req, res, next) {
  if (req.user) {
    return next();
  }

  res.redirect("/users/login");
}

app.use("/", welcomeRouter);
app.use("/home", ensureLoggedIn, homeRouter);
app.use("/users", usersRouter);
app.use("/users/login", passport.authenticate("oidc"));
// app.use(
//   "/authorization-code/callback",
//   passport.authenticate("oidc", { failureRedirect: "/" }),
//   (req, res) => {
//     res.redirect("/home");
//   }
// );

app.use("/profile", ensureLoggedIn, (req, res) => {
  res.render("pages/profile.html", {
    user: req.user.displayName,
    firstName: req.user.name.givenName,
    lastName: req.user.name.familyName,
    email: req.user._json.preferred_username
  });
});

// stop the favicon 404
app.get("/favicon.icon", (req, res) => res.status(204));

app.get("/user", (req, res) => {
  oktaClient
    .getUser(req.query.user_id)
    .then(user => {
      res.status(200);
      res.send(user);
    })
    .catch(err => {
      res.status(400);
      res.send(err);
    });
});

app.delete("/user/delete", (req, res) => {
  oktaClient
    .getUser(req.user.id)
    .then(user => {
      user
        .deactivate()
        .then(() => console.log("User has been deactivated"))
        .then(() => user.delete())
        .then(() => {
          console.log("User has been deleted");
          req.logout();
          req.session.destroy();
          res.status(200);
          res.send("Successful deletion");
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send(err);
    });
});

app.get("/chip/:thread_url", ensureLoggedIn, (req, res) => {
  db.one("SELECT * FROM threads WHERE thread_url = $1", [req.params.thread_url])
    .then(data => {
      req.session.thread = data;
      res.status(200);
      res.render("pages/thread_template.html", {
        thread_title: data.title,
        thread_url: data.thread_url,
        thread_description: data.about
      });
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send(err);
    });
});

app.post("/thread", (req, res) => {
  const thread_info = req.body;
  db.none(
    "INSERT INTO threads(title, about, public, thread_url, admin_id) VALUES($1, $2, $3, $4, $5);",
    [
      thread_info.title,
      thread_info.about,
      thread_info.public,
      thread_info.url,
      req.user.id
    ]
  )
    .then(() => {
      res.status(200);
      res.send("Thread creation successful");
    })
    .catch(err => {
      res.status(400);
      res.send("Thread creation failed");
    });
});

app.get("/threads", (req, res) => {
  db.any("SELECT * FROM threads ORDER BY thread_id DESC;")
    .then(data => {
      res.status(200);
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(400);
      res.send(err);
    });
});

// create post
app.post("/post", (req, res) => {
  const post_info = req.body;
  db.none(
    "INSERT INTO posts(title, content, user_id, thread_id, username) VALUES($1, $2, $3, $4, $5);",
    [
      post_info.title,
      post_info.content,
      req.user.id,
      req.session.thread.thread_id,
      req.user.displayName
    ]
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
  db.any("SELECT * FROM posts WHERE thread_id = $1 ORDER BY post_id DESC;", [
    req.session.thread.thread_id
  ])
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
