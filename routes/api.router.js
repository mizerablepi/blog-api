const router = require("express").Router();
const blogController = require("../controllers/blog.controller");

router.post("/test", blogController.test);

router.get("/blog", blogController.getAllBlogs);
router.get("/blog/:id", blogController.getBlog);

router.post("/blog/:id/update", blogController.updateBlog);
router.post("/blog/:id/delete", blogController.deleteBlog);
router.post("/blog/add", blogController.addBlog);

router.post("/blog/:id/comment/add", blogController.addComment);
router.post("/blog/:id/comment/delete", blogController.deleteComment);

router.post("/signup", blogController.signup);
router.post("/login", blogController.login);

module.exports = router;
