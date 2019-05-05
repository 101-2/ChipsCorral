const express = require("express");
const session = require("express-session");
const nunjucks = require("nunjucks");
const cors = require("cors");
const okta = require("@okta/okta-sdk-nodejs");
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

var oktaClient = new okta.Client({
  orgUrl: "https://dev-882471.okta.com",
  token: "00hK2PSWor0vUzqaLcqRYwhIy6EQ-KWH7Q5kZSID9c"
});

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
  passport.authenticate("oidc", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/home");
  }
);

// stop the favicon 404
app.get("/favicon.icon", (req, res) => res.status(204));

/**
 * @api {get} /profile
 * @apiName GetProfile
 * @apiGroup User
 *
 * @apiDescription Renders profile page with user info which has been stored in req.user. User must be logged in to access this.
 */
app.use("/profile", ensureLoggedIn, (req, res) => {
  res.render("pages/profile.html", {
    user: req.user.displayName,
    firstName: req.user.name.givenName,
    lastName: req.user.name.familyName,
    email: req.user._json.preferred_username
  });
});

/**
 * @api {get} /user
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {String} user_id Users unique ID sent as a request query.
 */
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

/**
 * @api {delete} /user/delete
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiDescription Used to delete user, will only delete user of id stored in req.user (current active user).
 */
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

/**
 * @api {get} /chip/:thread_url
 * @apiName GetThread
 * @apiGroup Thread
 *
 * @apiParam {String} thread_url Unique Thread URL used to find thread info in database.
 *
 * @apiDescription Renders thread based on the thread URL using a thread template.
 */
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

/**
 * @api {post} /thread
 * @apiName PostThread
 * @apiGroup Thread
 *
 * @apiParam {String} title Thread title sent in the request body
 * @apiParam {String} about Thread description sent in the request body
 * @apiParam {Boolean} public Boolean value sent in the request body to determine if thread is public or private
 * @apiParam {String} url A unique thread URL sent in the request body
 *
 * @apiDescription Pulls information from the request body and uses it to create a new thread.
 */
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

/**
 * @api {get} /threads
 * @apiName GetThreads
 * @apiGroup Thread
 *
 * @apiDescription Retrieves all threads in database.
 */
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

/**
 * @api {post} /post
 * @apiName PostPost
 * @apiGroup Post
 *
 * @apiParam {String} title The title of the post sent in the request body
 * @apiParam {String} content The content of the post sent in the request body
 *
 * @apiDescription Pulls information from request and creates a new post
 */
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

/**
 * @api {get} /posts
 * @apiName GetPosts
 * @apiGroup Post
 *
 * @apiDescription Gets all posts related to current thread
 */
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

/**
 * @api {get} /post
 * @apiName GetPost
 * @apiGroup Post
 *
 * @apiParam {Number} id Unique post id sent as a request query
 * @apiDescription Gets the information of a single post
 */
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

/**
 * @api {delete} /post
 * @apiName DeletePost
 * @apiGroup Post
 *
 * @apiParam {Number} id Unique post id sent as a request query
 * @apiDescription Deletes post with id
 */
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

app.listen(process.env.PORT || 5000, () => {
  console.log(`listening on port ${process.env.PORT || 5000}`);
});
