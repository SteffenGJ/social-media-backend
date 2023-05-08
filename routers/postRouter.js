const postRouter = require("express").Router();
const Post = require("../models/post");
const Comment = require("../models/comment");
const multer = require("multer");
const User = require("../models/user");

const storage = multer.memoryStorage();
const upload = multer({ storage });

postRouter.get("/", async (req, res) => {
  const post = await Post.find({});
  //.populate({ path: "author" })
  //.populate({ path: "comments", populate: { path: "author" } });
  console.log(post);
  res.json(post);
});

postRouter.get("/:id/comments", async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate("comments");

  res.json(post.comments);
});

postRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  res.json(post);
});

postRouter.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  const posts = await Post.find({ author: id });
  //.populate({ path: "author" })
  //.populate({ path: "comments", populate: { path: "author" } });
  res.json(posts);
});

postRouter.post("/", upload.single("postImage"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  const { text, authorId } = req.body;

  if (req.file) {
    const image = `data:${req.file.mimetype};base64,${Buffer.from(
      req.file.buffer
    ).toString("base64")}`;

    const newPost = {
      text,
      author: authorId,
      date: new Date(),
      likes: 0,
      comments: [],
      image: image,
    };

    const createPost = await Post.create(newPost);
    const user = await User.findById(authorId);
    user.posts.push(createPost.id);
    await user.save();
    const savedPost = await Post.findById(createPost.id).populate("author");

    console.log("SAVEDPOST", savedPost);
    console.log("CREATEPOST", createPost);
    return res.json(savedPost);
  }

  const newPost = {
    text,
    author: authorId,
    date: new Date(),
    likes: 0,
    comments: [],
    image: "None",
  };

  const createPost = await Post.create(newPost);
  const user = await User.findById(authorId);
  user.posts.push(createPost.id);
  await user.save();
  const savedPost = await Post.findById(createPost.id); /*.populate("author")*/

  console.log("SAVEDPOST", savedPost);
  console.log("CREATEPOST", createPost);
  return res.json(savedPost);
});

postRouter.post("/comment", async (req, res) => {
  const { postId, text, authorId } = req.body;

  console.log(postId, text, authorId);

  const newComment = {
    text,
    author: authorId,
    date: new Date(),
    post: postId,
  };

  const savedComment = await Comment.create(newComment);

  const post = await Post.findById(postId);
  post.comments.push(savedComment.id);
  await post.save();

  const findSavedComment = await Comment.findById(savedComment.id).populate(
    "author"
  );

  res.json(findSavedComment);
});

postRouter.get("/comment/:id", async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate({
    path: "comments",
    populate: { path: "author" },
  });

  res.json(post.comments);
});

postRouter.post("/like", async (req, res) => {
  const { postId } = req.body;

  const post = await Post.findById(postId);
  post.likes += 1;

  const savedPost = await post.save();

  res.json(savedPost.likes);
});

module.exports = postRouter;
