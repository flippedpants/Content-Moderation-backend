const {rateLimit} = require("express-rate-limiter");

//TODO - add a function to check if the user has premium or not to change the limit according to that

const apiLimiter = rateLimit({
    windowMs: 1000*60*5,
    limit: 100,
    handler: (req,res,next,options) => res.status(options.statusCode).send(options.message),
    standardHeaders: true,
    legacyHeaders: false,
    ipv6subnet: 56
})

module.exports = apiLimiter