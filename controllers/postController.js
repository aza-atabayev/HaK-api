const Post = require("../models/Post");
const User = require("../models/User");

class PostController {
    async createPost(req, res) {
        try {
            const {title, text, date} = req.body
            const post = new Post({title, text, date, authorId: req.user.id})
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
            } // TODO: think of another solution

            return res.json(posts)
        } catch (e) {
            console.log(e)
            return res.json(400).json({message: "Can't get posts"})
        }
    }

    async likePost(req, res) {
        try {
            const user = await User.findOne({"_id": req.user.id})

            // liked 1
            // disliked 0
            // like 1
            // 0
            if (!user.likedId.includes(req.body.post.id)) {
                // add id to likedId
                user.likedId.push(req.body.post.id)
                await user.save()
    
                // increase reputation of the post
                const post = await Post.findOne({"_id": req.body.post.id})
                post.reputation += 1
                await post.save()
                
                return res.json(200)
            }
            else {
                return res.json({message: "Already liked"})
            }


        } catch (e) {
            console.log(e)
            return res.json(400).json({message: "Can't like post"})
        }
    }
}

module.exports = new PostController()