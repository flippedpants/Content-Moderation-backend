const {verifyPassword} = require("../services/hashService")
const User = require("../models/user.js")
const {generateToken} = require("../services/jwtService.js");
const {validationResult} = require("express-validator")

const login = async(req,res) => {
    const result = validationResult(req)

    if(!result.isEmpty()){
        return res.status(400).json({errors : result.array()})
    }

    try{
        const {email, password} = req.body;

        const userExists = await User.findOne({email});
        if(!userExists){
            return res.status(400).json({message: "User not found!"});
        }
        
        const match = await verifyPassword(password, userExists.password);
        if(!match){
            return res.status(400).json({message: "Invalid email or password!"});
        }

        const token = generateToken({id:userExists._id, email:userExists.email})

        res.json({message: "Login successful", token:token})
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

module.exports = login;