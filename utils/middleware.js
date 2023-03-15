const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcrypt");
const {CLIENT_ID, CLIENT_SECRET} = require("./config");

const localStrategy = new LocalStrategy(
    async function(username, password, done) {
        try {
        const user = await User.findOne({username})
        console.log(user);
        
        if (!user) {
            return done(null, false);
        }

        const realPassword = await bcrypt.compare(password, user.password);

        if (!realPassword) {
            return done(null, false)
        }
        
        return done(null, user)
      } catch(e) {
          console.log("THIS IS AN ERROR", e);
          return done(e)
      }
    }
  );

const githubStrategy = new GitHubStrategy(
    {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: "http://localhost:3001/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        const user = await User.findOne({strategy: profile.id});
        if (user) {
            console.log("FOUND USER")
            return done(null, user);
        } else {

        const newUser = new User({
            username: profile.username,
            password: "Authentication through github",
            email: profile.email ? profile.email : "None provided",
            friends: [],
            official: false,
            strategy: profile.id,
            following: [],
            posts: [],
            profilePricture: "https://user-images.githubusercontent.com/11250/39013954-f5091c3a-43e6-11e8-9cac-37cf8e8c8e4e.jpg"
        })

            await newUser.save();

            return done(null, newUser);
        }
    }
);

  module.exports = {localStrategy, githubStrategy};