const express = require("express");
const app = express();
const cors = require("cors");
const loginRouter = require("./routers/loginRouter");
const userRouter = require("./routers/userRouter");
const mongoose = require("mongoose");
const { MONGODB_URI } = require("./utils/config");
const passport = require("passport");
const { localStrategy, githubStrategy } = require("./utils/middleware");
const session = require("express-session");
const User = require("./models/user");
const logoutRouter = require("./routers/logoutRouter");
const postRouter = require("./routers/postRouter");

mongoose.connect(
  MONGODB_URI,
  () => {
    console.log("CONNECTED TO DATABASE");
  },
  () => {
    console.log("ERROR CONNECTING TO DATABASE");
  }
);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  session({
    secret: "secret-key",
    cookie: { maxAge: 3560000 },
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(localStrategy);
passport.use(githubStrategy);

passport.serializeUser(function (user, done) {
  console.log("Serialize");
  console.log(typeof user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log(typeof id);
  console.log("DESERIALIZE");
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

app.get("/api/error", (req, res) => {
  console.log(req);
  console.log("THE ABOVE IS MINE BTW. KH /API/ERROR");
  res.status(400).json({ status: 400, message: "error" });
});
app.use(
  "/api/login",
  passport.authenticate("local", { failureRedirect: "/api/error" }),
  loginRouter
);
app.use("/api/posts", postRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/user", userRouter);
app.get("/api/success", (req, res) => {
  console.log("I AM HERE AT SUCCESS ROUTER");
  console.log(req.session);
  res.json(req.session.passport.user);
});

app.get("/auth/github", passport.authenticate("github", { scope: ["user"] }));
app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/api/login",
    successRedirect: "http://localhost:3000/dashboard",
  })
);

module.exports = app;
