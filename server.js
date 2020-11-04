const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const passport=require('passport')
const setupPassport=require("./passport");
const knexfile = require("./knexfile");
const app = express();
const db=require('./db');

// server session setup
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

const port = 5000;

//middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname+'/public'));

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
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

//GET the the loggedin dashboard page
app.get("/dashboard",isLoggedIn,(req,res)=>{
// res.render('dashboard')
res.render("createProfile");
})

//GET the login page
app.get("/login",(req,res)=>{
  // res.render('dashboard')
  res.render("loginRegister")
  })

//POST login
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/dashboard',
  failureRedirect: '/error'
}));

//POST register
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/login',
  failureRedirect: '/error'
}));


//set up the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}.`);
});