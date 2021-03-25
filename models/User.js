const { Schema, model, ObjectId } = require("mongoose") 

const User = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verified: {type: Boolean, default: false},
    reputation: {type: Number, default: 0},
    likedId: [{type: ObjectId, ref: 'Post'}],
    dislikedId: [{type: ObjectId, ref: 'Post'}],
    pic: {type: String}
})

module.exports = model("User", User)