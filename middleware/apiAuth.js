const { hashApiKey } = require("../services/keyService.js");
const ApiKey = require("../models/apiKey.js");

const verifyApi = async(req,res,next) => {
    try{
        const clientKey = req.headers['x-api-key'];

        if(!clientKey){
            return res.status(401).json({ message: "API key is required!"});
        }

        const hashedClientKey = hashApiKey(clientKey);

        const app = await ApiKey.findOne({ apiKeyHash: hashedClientKey, isActive: true});

        if(!app){
            return res.status(401).json({ message: "Invalid API key!"})
        }

        // update last used time
        app.lastUsed = new Date();
        await app.save();

        req.appContext = app;
        next();
    }
    catch(err){
        res.status(500).json({message : err.message})
    }
}

module.exports = verifyApi;