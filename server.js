const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const setupPassport = require("./passport");
const knexfile = require("./knexfile");
const app = express();
const db = require("./db");

// server session setup
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

const port = 5000;

//middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

setupPassport(app);

app.set("view engine", "ejs");

//index page
app.get("/", (req, res) => {
  res.render("index");
});

// Logout using POST
app.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

//function to check if the user is authenicated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/error");
  }
}

//GET the the loggedin dashboard page
// app.get("/dashboard/:username", isLoggedIn, (req, res) => {
//   // res.render('dashboard')
//   res.render("browseEvents", { username: req.params.username });
// });

app.post("/create/:username", isLoggedIn, async (req, res) => {
  try {
    const username = req.params.username;
    let userProfile = {
      nickname: req.body.nickname,
      photo: req.body.photo,
      gender: req.body.gender,
      description: req.body.description,
    };
    console.log(req.body);
    db("users")
      .where("email", "=", req.params.username)
      .update(userProfile)
      .then(
        db
          .select()
          .from("events")
          .then((data) => {
            // console.log(data);
            res.render("browseEvents", { username: username, data: data });
            // res.redirect(`/events/${username}`);
          })
      );

    // console.log(req.body);
  } catch (err) {
    console.log(err);
  }
});

//POST data on creating events
app.post("/create-events/:username", isLoggedIn, (req, res) => {
  try {
    const username = req.params.username;
    let eventProfile = {
      name: req.body.name,
      photo: req.body.photo,
      categories: req.body.categories,
      location: req.body.location,
      date: req.body.date,
      max_participants: req.body.max_participants,
      description: req.body.description,
    };
    db.insert(eventProfile)
      .returning("*")
      .into("events")
      .then(() => {
        res.render("browseEvents", { username: username, data: data });
      });
  } catch (err) {
    console.log(err);
  }
  // try {
  //   console.log(req.body);
  //   // let { categories, location, description } = req.body;
  //   // let errors = [];
  //   // if (!categories || !location || !description) {
  //   //   errors.push({ message: "Please enter all fields" });
  //   // } else {
  //   //   const username = req.params.username;
  //   //   db.insert(req.body)
  //   //     .returning("*")
  //   //     .into("events")
  //   //     .then(() => {
  //         res.redirect(`/dashboard/${username}`);
  //         });
  //       console.log(req.body);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
});

app.get("/create-events/:username", (req, res) => {
  const username = req.params.username;
  res.render("createEvents", { username: username });
});

app.get("/dashboard/:username", isLoggedIn, async (req, res) => {
  try {
    const username = req.params.username;
    db.select()
      .from("events")
      .then((data) => {
        // console.log(data);
        res.render("browseEvents", { username: username, data: data });
        // res.redirect(`/events/${username}`);
      });
  } catch (err) {
    console.log(err);
  }
});

app.get("/error", (req, res) => {
  res.render("error");
});

app.get("/events/:username", (req, res) => {
  res.render("browseEvents", { username: req.params.username });
});

//GET the login page
app.get("/login", (req, res) => {
  // res.render('dashboard')
  res.render("loginRegister");
});

//GET the login page
app.get("/create/:username", (req, res) => {
  // res.render('dashboard')
  res.render("createProfile", { username: req.params.username });
});

//POST login
let slug = [];
app.post(
  "/login",
  passport.authenticate("local-login", {
    failureRedirect: "/error",
  }),
  (req, res) => {
    console.log(`hi`);
    slug = [];
    slug.push(req.body.username);
    res.redirect(`/dashboard/${slug[0]}`);
  }
);

//POST register
app.post(
  "/signup",
  passport.authenticate("local-signup", {
    failureRedirect: "/error",
  }),
  (req, res) => {
    console.log(`hi`);
    slug = [];
    slug.push(req.body.username);
    res.redirect(`/create/${slug[0]}`);
  }
);

//set up the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}.`);
});
