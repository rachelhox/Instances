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

app.get("/logout", (req, res) => {
  res.redirect("/");
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

app.post("/create/:username/:id", isLoggedIn, async (req, res) => {
  try {
    const username = req.params.username;
    const id = req.params.id;
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
            res.render("browseEvents", {
              username: username,
              id: id,
              data: data,
            });
          })
      );

    // console.log(req.body);
  } catch (err) {
    console.log(err);
  }
});

//POST data on creating events
app.post("/create-events/:username/:id", isLoggedIn, (req, res) => {
  try {
    const username = req.params.username;
    const id = req.params.id;
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
      .then((data) => {
        res.render("browseEvents", { username: username, id: id, data: data });
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

app.get("/create-events/:username/:id", (req, res) => {
  const username = req.params.username;
  const id = req.params.id;
  res.render("createEvents", { username: username, id: id });
});

app.get("/dashboard/:username/:id", isLoggedIn, async (req, res) => {
  try {
    const username = req.params.username;
    const id = req.params.id;
    db.select()
      .from("events")
      .then((data) => {
        // console.log(data);
        res.render("browseEvents", { username: username, id: id, data: data });
        // res.redirect(`/events/${username}`);
      });
  } catch (err) {
    console.log(err);
  }
});

app.get("/error", (req, res) => {
  res.render("error");
});

app.get("/events/:username/:id", (req, res) => {
  res.render("browseEvents", {
    username: req.params.username,
    id: req.params.id,
  });
});

//GET the login page
app.get("/login", (req, res) => {
  // res.render('dashboard')
  res.render("loginRegister");
});

//GET the login page
app.get("/create/:username/:id", (req, res) => {
  // res.render('dashboard')
  res.render("createProfile", {
    username: req.params.username,
    id: req.params.id,
  });
});

//POST login
let slug = [];
app.post(
  "/login",
  passport.authenticate("local-login", {
    failureRedirect: "/error",
  }),
  async (req, res) => {
    try {
      const id = await db("users")
        .select("id")
        .where("email", "=", req.body.username);
      slug = [];
      slug.push(req.body.username);
      slug.push(Object.values(id[0]));
      res.redirect(`/dashboard/${slug[0]}/${slug[1]}`);
    } catch (err) {
      console.log(err);
    }
  }
);

//POST register
let api = [];
app.post(
  "/signup",
  passport.authenticate("local-signup", {
    failureRedirect: "/error",
  }),
  async (req, res) => {
    try {
      const id = await db("users")
        .select("id")
        .where("email", "=", req.body.username);
      api = [];
      api.push(req.body.username);
      api.push(Object.values(id[0]));
      res.redirect(`/create/${api[0]}/${api[1]}`);
    } catch (err) {
      console.log(err);
    }
  }
);

//POST filtering events based on selection
app.post("/filter-events/:username/:id", async (req, res) => {
  try {
    const username = req.params.username;
    const id = req.params.id;
    db("events")
      .where((qb) => {
        if (req.body.location) {
          console.log(req.body.location);
          qb.where("events.location", "=", req.body.location);
        }
        if (req.body.categories) {
          console.log(req.body.categories);
          qb.andWhere("events.categories", "=", req.body.categories);
        }
        if (req.body.max_participants) {
          console.log(req.body.max_participants);
          qb.andWhere(
            "events.max_participants",
            "<=",
            req.body.max_participants
          );
        }
      })
      .then((data) => {
        res.render("browseEvents", { username: username, id: id, data: data });
      });
  } catch (err) {
    console.log(err);
  }
});

//set up the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}.`);
});
