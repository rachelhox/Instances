const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const knexfile = require("./knexfile");

const ejs = require("ejs");

const router = require("./router/router")(express, passport);

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({ secret: "Super Secret", resave: false, saveUninitialized: true })
);

// connection to database
require("dotenv").config();

const knexFile = require("./knexfile").development;
const knex = require("knex")(knexFile);

// letting the app knows that we are usig passport
app.use(passport.initialize());
app.use(passport.session());

//setting up local strategies
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("./bcrypt.js");

// Setting up Login system:
// same strategy as passport.autheticate("local-login", {redirect object}), in router.js
passport.use(
  "local-login",
  new LocalStrategy(async (email, password, done) => {
    try {
      console.log(`Logging in ...`);
      let users = await knex("users").where({ email: email });
      // no user was found:
      if (users.length == 0) {
        return done(null, false, { message: "Incorrect User" });
      }
      let user = users[0];
      // it's assumed that the password info is already been hashed
      let result = await bcrypt.checkPassword(password, user.password);
      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect username or password" });
      }
    } catch (err) {
      done(err);
    }
  })
);

// Setting up Signup system:
passport.use(
  "local-signup",
  new LocalStrategy(async (email, password, done) => {
    try {
      // check to see if the user is already in the database
      let users = await knex("users").where({ email: email });
      if (users.length > 0) {
        return done(null, false, { message: "Email is in use..." });
      }
      // add hash later (bcrypt stuff)
      // using bcrypt to hash password on signing up
      let hash = await bcrypt.hashPassword(password);

      const newUser = {
        email: email,
        password: hash,
      };

      // allow us to grab the id that we just inserted
      let userID = await knex("users").insert(newUser).returning("id");
      // adding a new key to the newUser object !!!
      // so that we have a user id from out database for this new user:
      newUser.id = userID[0];
      done(null, newUser);
    } catch (err) {
      done(err);
    }
  })
);

// SERIALISATION:
// As logging in uses sessions, we need to unpack the user info
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use("/", router);

app.listen(port, () => {
  console.log(`port running on http://localhost:${port}.`);
});
