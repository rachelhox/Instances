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
    //console.log(req.body);
    db("users")
      .where("email", "=", req.params.username)
      .update(userProfile)
      .then(
        db
          .select()
          .from("events")
          .then((data) => {
            res.redirect(`/dashboard/${username}/${id}`);
            // res.render("browseEvents", {
            //   username: username,
            //   id: id,
            //   data: data,
            // });
          })
      );

    // console.log(req.body);
  } catch (err) {
    console.log(err);
  }
});

//POST data on creating events
let endpoint = [];
app.post("/create-events/:username/:id", isLoggedIn, (req, res) => {
  try {
    endpoint = [];
    const username = req.params.username;
    const id = req.params.id;
    endpoint.push(username);
    endpoint.push(id);
    let eventProfile = {
      name: req.body.name,
      photo: req.body.photo,
      categories: req.body.categories,
      location: req.body.location,
      date: req.body.date,
      max_participants: req.body.max_participants,
      description: req.body.description,
      user_id: id,
    };
    //const data = await
    db.insert(eventProfile)
      .returning("*")
      .into("events")
      .then((data) => {
        //res.render("browseEvents", { username: username, id: id, data: data });
        res.redirect(`/dashboard/${endpoint[0]}/${endpoint[1]}`);
      });
  } catch (err) {
    console.log(err);
  }

  // app.get("/dashboard/:username/:id/:data", (req, res) => {
  //   const username = req.params.username;
  //   const id = req.params.id;
  //   const data = [req.params.data];
  //   console.log(data[0]);
  //   res.render("browseEvents", { username: username, id: id, data: data });
  // });
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
      .whereNot("events.user_id", "=", id)
      .then((data) => {
        //console.log(data);
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

// GET the profile page
app.get("/profile/:username/:id", async (req, res) => {
  let eventData = await db("events")
    .select()
    .where("user_id", "=", req.params.id);
  //console.log(eventData);
  db("users")
    .select()
    .where("id", "=", req.params.id)
    .then((data) => {
      //console.log(data);
      res.render("browseProfile", {
        username: req.params.username,
        id: req.params.id,
        data: data,
        eventData: eventData,
      });
    });
});

// GET the login page
app.get("/login", (req, res) => {
  // res.render('dashboard')
  res.render("loginRegister");
});

// GET the login page after signing up
app.get("/create/:username/:id", (req, res) => {
  // res.render('dashboard')
  res.render("createProfile", {
    username: req.params.username,
    id: req.params.id,
  });
});

// GET the myEvents page for specific event
app.get("/myEvents/:username/:id/:eventId", isLoggedIn, async (req, res) => {
  const id = req.params.id;
  const eventId = req.params.eventId;
  const data = await db("events")
    .select("*")
    .where("events.user_id", "=", id)
    .where("events.id", "=", eventId);
  //console.log("myEvent" + data);
  //console.log("HIII");
  //console.log(data);
  const anotherdata = await db("users_events")
    .select("user_id")
    .where("users_events.event_id", "=", eventId)
    //new line of trying 
    .andWhere("users_events.acceptance","=",false);
  //console.log(anotherdata);
  let finalArray = [];
  for (let i = 0; i < anotherdata.length; i++) {
    let finaldata = await db("users")
      .select("*")
      .where("users.id", "=", anotherdata[i].user_id);
    finalArray.push(...finaldata);
  }
  //console.log(finalArray);

  //new line of trying
  const accepteddata= await db("users_events")
  .select("user_id")
  .where("users_events.event_id","=",eventId)
  .andWhere("users_events.acceptance","=",true);
  let accetpedArray=[]
  for(let b=0;b<accepteddata.length;b++){
    let finalacceptdata=await db("users").select("*").where("users.id","=",accepteddata[b].user_id)
    accetpedArray.push(...finalacceptdata);
  }
  console.log(accetpedArray);


  res.render("MyEvents", {
    username: req.params.username,
    id: req.params.id,
    data: data,
    eventId: req.params.eventId,
    waitingdata: finalArray,
    accepteddata: accetpedArray
  });
});

// POST login
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

// POST register
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

// POST imgur api for profile picture
app.post("/api/img/:id", (req, res) => {
  const username = req.params.username;
  const id = req.params.id;
  //console.log(req.body.image);
  const img = req.body.image;
  db("users")
    .update({ photo: img })
    .where("id", "=", req.params.id)
    .then(console.log(req.params.id));
});

// POST imgur api for event photo
app.post("/api/image/:name", (req, res) => {
  const name = req.body.name;
  const image = req.body.image;
  //console.log(`posting api to event photo`);
  db("events")
    .update({ photo: image })
    .where("name", "=", name)
    .then(console.log(name));

  res.send("DONE");
});

// POST editing the profile
app.post("/edit-profile/:username/:id", async (req, res) => {
  try {
    const username = req.params.username;
    const id = req.params.id;
    let newUserProfile = {
      nickname: req.body.nickname,
      gender: req.body.gender,
      description: req.body.description,
    };
    const data = await db("users")
      .update(newUserProfile)
      .select("*")
      .where("id", "=", id);
    res.redirect("back");
  } catch (err) {
    console.log(err);
  }
});

// POST filtering events based on selection
app.post("/filter-events/:username/:id", async (req, res) => {
  try {
    const username = req.params.username;
    const id = req.params.id;
    db("events")
      .where((qb) => {
        if (req.body.location) {
          //console.log(req.body.location);
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

// POST join events
app.post("/join/:username/:id", isLoggedIn, (req, res) => {
  const username = req.params.username;
  const id = req.params.id;
  let user_id = req.params.id;
  let event_id = req.body.joinevents;
  console.log(user_id);
  console.log("waiting for approlval");
  console.log(event_id);
  db("users_events")
    .insert({ user_id: user_id, event_id: event_id, acceptance: false })
    .then(res.redirect(`/dashboard/${username}/${id}`));
});

// get all the events created by the user
app.get("/myEvents/:username/:id", isLoggedIn, async (req, res) => {
  const username = req.params.username;
  const id = req.params.id;

  const data = await db("events").select("*").where("events.user_id", "=", id);
  console.log(data);
  // let hostedEventData = [];
  // for (let i = 0; i < data.length; i++) {
  //   const data1 = await db("users_events")
  //     .select("*")
  //     .where("users_events.event_id", "=", data[i]);
  //   hostedEventData.push(data1);
  // }
  // console.log("HI");
  // console.log(hostedEventData);

  // const requestedData = await db("users_events")
  //   .select("user_id")
  //   .where("event_id", "=", data[i].id);

  // console.log(requestedData);

  res.render(
    //so the ejs is called MyEvents.ejs
    "MyEvents",
    {
      username: username,
      id: id,
      data: data,
    }
  );
});

//chaging the status of acceptance for event request
app.post("/changestatus/:username/:id/:eventId",isLoggedIn,async (req,res)=>{
  const username = req.params.username;
  const id = req.params.id;
  let request_id=req.body.requesting_users_id;
  console.log(request_id)
  let update={
    acceptance:true
  }
  const changedata= await db("users_events").where("users_events.user_id","=",request_id).update(update)
  //need to render something here

})


//set up the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}.`);
});
