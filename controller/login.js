const User = require("..model/user.js");
const {hashPassword, comparePassword} = require("../services/hashService.js");
const {genearteToken, verifyToken} = require("../services/jwtService.js");

const register = async(req,res) => {
    const {email, password} = req.body;

    const userExists = User.findOne({email});
    if(userExists){
        return res.status(400).json({message: "User already exists!"});
    }

    const hashedPassword = await hashPassword(password);

    
}