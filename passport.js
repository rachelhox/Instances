const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db=require("./db")
const bcrypt=require("./bcrypt.js")

module.exports = (server) => {
    server.use(passport.initialize());
    server.use(passport.session());


    passport.use('local-login', new LocalStrategy(
        async (email, password, done) => {
            try{
                let users = await db('users').where({email:email})
                if(users.length == 0){
                    return done(null, false, { message: 'Incorrect credentials' });
                }
                let user = users[0];
                let result = await bcrypt.checkPassword(password, user.password);
                if(result) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect credentials'});
                }
            }catch(err){
                done(err);
            }
        }
    ));

  //sign up creation
  passport.use('local-signup',new LocalStrategy(
      async(email,password,done)=>{
          try{
            let users = await db('users').where({email:email});
            if (users.length > 0) {
                return done(null, false, { message: 'Email already taken' });
            }
            let hash = await bcrypt.hashPassword(password)
            const newUser = {
                email:email,
                password: hash
            };
            let userId = await db('users').insert(newUser).returning('id');
            newUser.id = userId[0];
            done(null,newUser);
          }catch(err){done(err)};
      }
  ))

  //serializeuser into sesion  with cookies and userid
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        let users = await db('users').where({id:id});
        if (users.length == 0) {
            return done(new Error(`Wrong user id ${id}`));
        }
        let user = users[0];
        return done(null, user);
    });

};