const { Schema, model, ObjectId } = require("mongoose") 

const User = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verified: {type: Boolean, default: false},
    reputation: {type: Number, default: 0},
    pic: {type: String}
})

module.exports = model("User", User)