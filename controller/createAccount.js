const crypto = require("crypto");
const Application = require("../models/application.js");
const User = require("../model/user.js");
const {hashPassword, verifyPassword} = require("../services/hashService.js");

const createAcc = async(req,res) => {
    try{
        const { email,password,name, plan } = req.body;

        const userExists = await User.findOne({email})
        if(userExists){
            return res.status(400).json({message: "User already exists!"})
        }

        const { v4: uuidv4 } = await import("uuid");
        const appId = uuidv4();
        const rawKey = `app_key_${crypto.randomBytes(24).toString('hex')}`;

        const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
        const hashedPassword = await hashPassword(password)

        const newApp = new Application({
            appId : appId,
            name: name,
            apiKeyHash: hashedKey,
            plan: plan || "free",
            isActive: true
        })

        const newUser = new User({
            email : email,
            password: hashedPassword,
            appId: appId
        })

        await newUser.save();
        await newApp.save();

        res.status(201).json({ message: "App sccessfully added",
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