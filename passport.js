const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const knex = require("knex")({
  client: "postgresql",
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
});

// passport.use(
//   "local-signup",
//   new LocalStrategy(async (email, password, done) => {
//     try {
//       let users = await knex("users").where({ email: email });
//       if (users.length > 0) {
//         return done(null, false, { message: "Email already taken" });
//       }
//       const newUser = {
//         email: email,
//         password: password,
//       };
//       let userId = await knex("users").insert(newUser).returning("id");
//       newUser.id = userId[0];
//       done(null, newUser);
//     } catch (err) {
//       done(err);
//     }
//   })
// );

// passport.use(
//   "local-login",
//   new LocalStrategy(async (email, password, done) => {
//     try {
//       let users = await knex("users").where({ email: email });
//       if (users.length == 0) {
//         return done(null, false, { message: "Incorrect credentials" });
//       }
//       let user = users[0];
//       let result = await bcrypt.checkPassword(password, user.password);
//       if (result) {
//         return done(null, user);
//       } else {
//         return done(null, false, { message: "Incorrect credentials" });
//       }
//     } catch (err) {
//       done(err);
//     }
//   })
// );

passport.use(
  "local-signup",
  new LocalStrategy(async (email, password, done) => {
    try {
      let users = await knex("users").where({ email: email });
      if (users.length > 0) {
        return done(null, false, { message: "Email already taken" });
      }
      const newUser = {
        email: email,
        password: password,
      };
      let userId = await knex("users").insert(newUser).returning("id");
      newUser.id = userId[0];
      done(null, newUser);
    } catch (err) {
      done(err);
    }
  })
);

module.exports = (server) => {
  server.use(passport.initialize());
  server.use(passport.session());
};
