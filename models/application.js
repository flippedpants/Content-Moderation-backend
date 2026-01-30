const mongoose = require("mongoose");

const appSchema = new mongoose.Schema({
    appId: {type: String, required: true, unique:true},
    name: {type: String, required:true},
    apiKeyHash: {type: String, required: true},
    plan: {type: String,  default:"free"},
    isActive: {type: String, default: true}
})

module.exports = mongoose.model("Application", appSchema);