const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req,res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({error: "No token"});
    }

    try{
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("_id username");
        if(!user) return res.status(401).json({error: "invalid token"});
        req.user = user;
        req.userId = decoded.userId;
        next()
    } catch(err){
        return res.status(401).json({error: "Token failed"});
    }
}

