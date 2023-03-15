const logoutRouter = require("express").Router();

logoutRouter.get("/", (req, res) => {
    req.logout((err) => {
        console.log(err);
    })
    res.json("LOGGED OUT");
})

module.exports = logoutRouter;