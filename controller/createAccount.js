const { generateApiKey } = require("../services/keyService.js");
const ApiKey = require("../models/apiKey.js");
const User = require("../models/user.js");
const {hashPassword } = require("../services/hashService.js");
const {validationResult} = require("express-validator")

const createAcc = async(req,res) => {
    const result = validationResult(req)

    if(!result.isEmpty()){
        return res.status(400).json({errors : result.array()})
    }

    try{
        const { email,password,name, plan } = req.body;

        const userExists = await User.findOne({email})
        if(userExists){
            return res.status(400).json({message: "User already exists!"})
        }

        const { v4: uuidv4 } = await import("uuid");
        const appId = uuidv4();
        const { rawKey, prefix, hashedKey } = generateApiKey();
        const hashedPassword = await hashPassword(password);

        const newKey = new ApiKey({
            appId : appId,
            name: name || "Default Key",
            apiKeyHash: hashedKey,
            prefix: prefix,
            isActive: true
        });

        const newUser = new User({
            email : email,
            password: hashedPassword,
            appId: appId
        })

        await newUser.save();
        await newKey.save();

        res.status(201).json({ message: "Account successfully created",
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