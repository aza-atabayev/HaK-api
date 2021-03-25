const Router = require("express");
const postController = require("../controllers/postController");
const router = new Router();
const authMiddleware = require("../middleware/auth.middleware");

router.get("", authMiddleware, postController.getPosts)
router.post("", authMiddleware, postController.createPost)
router.put("", authMiddleware, postController.likePost)

module.exports = router