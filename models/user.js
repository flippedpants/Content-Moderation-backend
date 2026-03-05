const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    appId: {type: String, unique:true, required:true}
})

module.exports = mongoose.model("User", userSchema);