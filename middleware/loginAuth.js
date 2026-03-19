const {verifyToken} = require("../services/jwtService.js")

const verify = async(req,res,next) => {
    const authHeader = req.headers["authorization"]

    if(!authHeader){
        return res.status(401).json({message: "No auth header provided"})
    }

    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({message: "No token provided"})
    }

    try{
        const decode = verifyToken(token);

        req.user = decode;
        next();
    }
    catch(err){
        res.status(401).json({message: "Invalid token"})
    }

}

module.exports = verify;