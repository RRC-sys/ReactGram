const User = require("../models/User");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET

const authGuard = async (req, res, next) => {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //Checar Token
    if(!token) {
        res.status(401).json({
            errors: ["Acesso negado!"]
        });

        return;
    }

    // Checar Token
    try {

        const verified = jwt.verify(token, jwtSecret);

        req.user = await User.findById(verified.id).select("-password");

        next();

    } catch(error) {
        res.status(401).json({
            errors: ["Token inválido."]
        });

        return;
    }

}

module.exports = authGuard