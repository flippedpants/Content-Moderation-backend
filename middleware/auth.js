const crypto = require("crypto");
const Application = require("../models/application.js");

const verifyApp = async(req,res,next) => {
    try{
        const clientKey = req.headers['x-api-key'];
        console.log(clientKey);

        if(!clientKey){
            res.status(401).json({ message: "API key is required!"});
        }

        const hashedClientKey = crypto.createHash('sha256').update(clientKey).digest('hex');

        const app = await Application.findOne({ appKeyHash: hashedClientKey, isActive: true});

        if(!app){
            res.status(401).json({ message: "Invalid API key!"})
        }

        req.appContext = app;
        next();
    }
    catch(err){
        res.status(500).json({message : err.message})
    }
}

module.exports = verifyApp;