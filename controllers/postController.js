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
            const post = await Post.findOne({"_id": req.body.post._id})

            if (req.body.type) { // if liked
                var index = user.likedId.indexOf(req.body.post._id)
                if (index != -1) { // if liked the same post again
                    user.likedId.splice(index, 1)
                    post.reputation -= 1
                }
                else {
                    var index = user.dislikedId.indexOf(req.body.post._id)
                    if (index != -1) { // if liked a disliked post
                        user.dislikedId.splice(index, 1)
                        post.reputation += 2
                    }
                    else {
                        post.reputation += 1
                    }
                    user.likedId.push(req.body.post._id)
                }
            }
            else { // if disliked
                var index = user.dislikedId.indexOf(req.body.post._id)
                if (index != -1) { // if disliked the same post again
                    user.dislikedId.splice(index, 1)
                    post.reputation += 1
                }
                else {
                    var index = user.likedId.indexOf(req.body.post._id)
                    if (index != -1) { // if disliked liked post
                        user.likedId.splice(index, 1)
                        post.reputation -= 2
                    }
                    else {
                        post.reputation -= 1
                    }
                    user.dislikedId.push(req.body.post._id)
                }
            }
            await post.save()
            await user.save()

            return res.json(200)
        } catch (e) {
            console.log(e)
            return res.json(400).json({message: "Can't react to post"})
        }
    }
}

module.exports = new PostController()