module.exports = (express) => {
  // const express = require("express");

  const passport = require("passport");

  const router = express.Router();

  const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  };

  //view router stuff (ejs/handlebars)

  router.get("/", (req, res) => {
    res.render("index");
  });
  router.get("/login", (req, res) => {
    res.render("login");
  });
  router.get("/signup", (req, res) => {
    res.render("signup");
  });
  router.get("/error", (req, res) => {
    res.render("error");
  });

  router.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
  });

  router.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/secret",
      failureRedirect: "/error",
    })
  );

  router.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/",
      failureRedirect: "/error",
    })
  );

  // Log out Route
  router.get("/logout", (req, res) => {
    // passport function .logout()
    req.logout();
    res.redirect("/login");
  });

  return router;
};
