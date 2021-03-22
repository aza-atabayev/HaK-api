const { Schema, model, ObjectId} = require("mongoose")

const Post = new Schema({
    title: {type: String, required: true},
    text: {type: String, required: true},
    reputation: {type: Number, default: 0},
    accessLink: {type: String},
    author: {type: String, default: "Anonymous"},
    date: {type: Date, default: new Date()},
    authorId: {type: ObjectId, ref: 'User'},
    tags: [{type: String}]
})

module.exports = model("Post", Post)