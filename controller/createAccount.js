const crypto = require("crypto");
const Application = require("../models/application.js");

const createAcc = async(req,res) => {
    try{
        const { name, plan } = req.body;

        const { v4: uuidv4 } = await import("uuid");
        const appId = uuidv4();
        const rawKey = `app_key_${crypto.randomBytes(24).toString('hex')}`;

        const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

        const newApp = new Application({
            appId : appId,
            name: name,
            apiKeyHash: hashedKey,
            plan: plan || "true",
            isActive: true
        })

        await newApp.save();

        res.status(201).json({ message: "App sccesfully added",
            appId: appId,
            appKey: rawKey,
            note: "Copy this key and save it, we won't show it again due to security reasons"
         })
    }
    catch(err){
        res.status(500).json({message: `Failed to register the app! - ${err.message}` });
    }
}

module.exports = createAcc;