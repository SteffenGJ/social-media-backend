const userRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { findFriendsOfFriends } = require("../utils/functions");

const storage = multer.memoryStorage();
const upload = multer({ storage });

userRouter.post("/", async (req, res) => {
  const { username, password, email } = req.body;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    password: passwordHash,
    email,
    official: false,
    strategy: "local",
    friends: [],
    following: [],
    posts: [],
    profilePicture:
      "https://user-images.githubusercontent.com/11250/39013954-f5091c3a-43e6-11e8-9cac-37cf8e8c8e4e.jpg",
  });

  const savedUser = await user.save();

  res.json(savedUser);
});

userRouter.get("/", (req, res) => {
  console.log(req.session);
  const { user } = req;
  console.log(user);
  res.json(user);
});

userRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  res.json(user);
});

userRouter.get("/:id/friends", async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).populate("friends");

  res.json(user.friends);
});

userRouter.get("/:id/friendRequests", async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).populate("incommingFriendRequests");

  console.log(user);

  res.json(user.incommingFriendRequests);
});

userRouter.post(
  "/:id/profilePicture",
  upload.single("profilePicture"),
  async (req, res) => {
    const { id } = req.params;

    const image = `data:${req.file.mimetype};base64,${Buffer.from(
      req.file.buffer
    ).toString("base64")}`;

    const user = await User.findById(id);
    user.profilePicture = image;

    const savedUser = await user.save();

    res.json(savedUser);
  }
);

userRouter.post("/:id/acceptFriend", async (req, res) => {
  const { id } = req.params;
  const { requesterId } = req.body;

  const requestee = await User.findById(id);
  const requester = await User.findById(requesterId);

  requestee.friends.push(requester.id);
  const requesteeIndex = requestee.incommingFriendRequests.findIndex(
    (req) => req == requesterId
  );

  requestee.incommingFriendRequests.splice(requesteeIndex, 1);

  requester.friends.push(requestee.id);
  const requesterIndex = requester.outgoingFriendRequests.findIndex(
    (req) => req == requestee.id
  );

  requester.outgoingFriendRequests.splice(requesterIndex, 1);

  await requestee.save();
  await requester.save();

  res.json(requestee);
});

userRouter.post("/friendRequest", async (req, res) => {
  const { userId, matchId } = req.body;

  const requester = await User.findById(userId);
  const requestee = await User.findById(matchId);

  requester.outgoingFriendRequests.push(requestee.id);
  requestee.incommingFriendRequests.push(requester.id);

  await requester.save();
  await requestee.save();

  res.json({ potentialFriend: requestee });
});

userRouter.post("/findByCurrent", async (req, res) => {
  const { currentValue } = req.body;

  const potentials = await User.find({
    username: { $regex: `^${currentValue}`, $options: "i" },
  }).limit(10);
  console.log(potentials);

  res.json(potentials);
});

userRouter.get("/logout", (req, res) => {
  req.logout();
  res.status(200).json({ message: "LOGGED OUT" });
});

userRouter.get("/:id/recommendedFriends", async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).populate({
    path: "friends",
    populate: { path: "friends" },
  });

  const friendsOfFriends = findFriendsOfFriends(user);

  res.json(friendsOfFriends);
});

module.exports = userRouter;
