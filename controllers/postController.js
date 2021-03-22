const Post = require("../models/Post");

class PostController {
    async createPost(req, res) {
        try {
            const {title, text} = req.body
            const post = new Post({title, text, authorId: req.user.id})
            await post.save()
            return res.json(post)
        } catch (e) {
            console.log(e)
            return res.status(400).json(e)
        }
    }

    async getPosts(req, res) {
        try {
            const page = req.query.page
            console.log(page)
            const posts = await Post.find({}).sort({"date": -1, "_id": 1}).skip(2*(page-1)).limit(2)
            
            //hiding information about the author
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].authorId != req.user.id) {
                    posts[i].authorId = "000000000000000000000000"
                }
            }

            return res.json(posts)
        } catch (e) {
            console.log(e)
            return res.json(400).json({message: "Can't get posts"})
        }
    }
}

module.exports = new PostController()