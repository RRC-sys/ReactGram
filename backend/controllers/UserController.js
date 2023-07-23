const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Gerar Token User
const generateToke = (id) => {
    return jwt.sign({id}, jwtSecret, {expiresIn: "7d"});
}

// Registrar User
const register = async(req, res) => {
    
    const { name, email, password } = req.body;

    // Check User
    const user = await User.findOne({email});

    if (user) {
        res.status(422).json({
            errors: ["Por favor, utilize outro e-mail!"]
        });

        return;
    }

    // Gerar Password hash
    const salt = await bcrypt.genSalt();

    const passwordHash = await bcrypt.hash(password, salt);

    // Criar User
    const newUser = await User.create({
        name,
        email,
        password: passwordHash
    });

    // Criado com sucesso
    if (!newUser) {
        res.status(422).json({
            errors: ["Houve um erro, por favor tente mais tarde."]
        })
        return;
    }

    // Retorna User e Token 
    res.status(201).json({
        _id: newUser._id,
        token: generateToke(newUser._id)
    })

}

// Login User
const login = async(req, res) => {
    
    const {email, password} = req.body

    const user = await User.findOne({email});

    // Chegar se User existe
    if(!user) {
        res.status(404).json({
            errors: ["Usuário não encontrado."]
        });

        return;
    }

    // Checar Password
    if (!(await bcrypt.compare(password, user.password))) {
        res.status(422).json({
            errors: ["Senha inválida."]
        })

        return;
    }

    // Retorna User, Imagem e Token
    res.status(201).json({
        _id: user._id,
        profileImage: user.profileImage,
        token: generateToke(user._id)
    })

}

// User Logado
const getCurrentUser = async(req, res) => {
    const user = req.user;

    res.status(200).json(user);
}

// Update User
const update = async(req, res) => {

    const { name, password, bio } = req.body;
    
    let profileImage = null;

    if(req.file) {
        profileImage = req.file.filename
    }

    const reqUser = req.user;


    const user = await User.findById(reqUser._id).select("-password");


    if(name) {
        user.name = name;
    }

    if(password) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        user.password = passwordHash;
    }

    if(profileImage) {
        user.profileImage = profileImage;
    }

    if(bio) {
        user.bio = bio;
    }

    await user.save();

    res.status(200).json(user);

}

// Obter User pelo Id
const getUserById = async(req, res) => {

    const { id } = req.params;

    // Verificar se User existe
    try {
        const user = await User.findById(id).select("-password");

        if(!user) {
            res.status(404).json({
                errors: ["Usuário não encontrado."]
            });

            return;
        }

        res.status(200).json(user);
    } catch(error) {
        res.status(404).json({
            errors: ["Usuário não encontrado."]
        });

        return;
    }

}

module.exports = {
    register,
    login,
    getCurrentUser,
    update,
    getUserById
}