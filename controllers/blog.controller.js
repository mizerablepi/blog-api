const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Blog = require("../models/blog");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().sort({ pub_date: -1 }).exec();
  const shortBlogs = blogs.map((blog) => {
    return { title: blog.title, summary: blog.summary, url: blog.url };
  });
  res.json(shortBlogs);
});

exports.getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("comments").exec();
  res.json({ blog });
});

exports.updateBlog = [
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (req.user.status === "user") {
      res.send("You are not authorized to do that");
    } else {
      next();
    }
  },
  body("title", "Enter Valid Title")
    .trim()
    .isLength({ min: 1, max: 128 })
    .escape(),
  body("content", "Enter Valid body").trim().isLength({ min: 1 }).escape(),
  body("status")
    .trim()
    .custom((string) => {
      if (string != "Published" && string != "Unpublished") {
        console.log("ERRRR");
        throw new Error("wrong status value");
      } else {
        return true;
      }
    })
    .escape(),
  body("pub_date", "Enter Valid Date").trim().isISO8601().escape(),
  asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id).exec();
    blog.title = req.body.title;
    blog.content = req.body.content;
    blog.status = req.body.status;
    blog.pub_date = req.body.pub_date;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json(errors);
    } else {
      blog.save();
      res.send("Success");
    }
  }),
];

exports.addBlog = [
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (req.user.status === "user") {
      res.send("You are not authorized to do that");
    } else {
      next();
    }
  },
  body("title", "Enter Valid Title")
    .trim()
    .isLength({ min: 1, max: 128 })
    .escape(),
  body("content", "Enter Valid body").trim().isLength({ min: 1 }).escape(),
  body("status")
    .trim()
    .custom((string) => {
      if (string != "Published" && string != "Unpublished") {
        console.log("ERRRR");
        throw new Error("wrong status value");
      } else {
        return true;
      }
    })
    .escape(),
  body("pub_date", "Enter Valid Date").trim().isISO8601().escape(),
  asyncHandler(async (req, res) => {
    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id,
      status: req.body.status,
      pub_date: req.body.pub_date,
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json(errors);
    } else {
      blog.save();
      res.send("Success");
    }
  }),
];

exports.deleteBlog = [
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (req.user.status === "user") {
      res.send("You are not authorized to do that");
    } else {
      next();
    }
  },
  asyncHandler(async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.send("Blog deleted");
  }),
];

exports.signup = asyncHandler(async (req, res) => {
  const userExists = await User.findOne({ username: req.body.username }).exec();
  if (userExists) {
    res.json({ message: "User already exists" });
  } else {
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedpassword,
    });
    user.save();
    res.status(200).send("success");
  }
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.body.username }).exec();

  if (!user) {
    res.json({ message: "username doesn't exist" });
  }
  const match = bcrypt.compare(req.body.password, user.password);
  if (match) {
    const token = jwt.sign({ username: user.username }, process.env.secret);
    return res.status(200).json({
      message: "Auth Passed",
      token,
    });
  }
});

exports.addComment = [
  passport.authenticate("jwt", { session: false }),
  body("content", "Enter Valid text")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .escape(),
  asyncHandler(async (req, res) => {
    const comment = new Comment({
      content: req.body.content,
      author: req.user._id,
    });
    const blog = await Blog.findById(req.params.id).exec();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json(errors);
    } else {
      comment.save();
      blog.comments.push(comment._id);
      console.log();
      blog.save();
      res.send("Success");
    }
  }),
];

exports.deleteComment = [
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (req.user.status === "user") {
      res.send("You are not authorized to do that");
    } else {
      next();
    }
  },
  asyncHandler(async (req, res) => {
    await Comment.findByIdAndDelete(req.params.id);
    res.send("Comment delted");
  }),
];

exports.test = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    console.log(req.user);
    res.send(req.user);
  }),
];
