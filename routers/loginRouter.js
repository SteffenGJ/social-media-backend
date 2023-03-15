const loginRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt")

loginRouter.post("/", (req, res) => {
    console.log("I AM HERE AT THE LOGIN ROUTER");
    console.log(req.session);
    res.status(201).json(req.session.passport.user);
})


module.exports = loginRouter;