const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

/**
 * @name register user constroller
 * @description register a new user
 * @access Public
 */
async function registerUserController(req, res){

    const { username, email , password } = req.body

    if(!username || !email || !password) {
        return res.status(400).json({
            message: "pls provide username,email,password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{username},{email}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "account already exists with this email or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)

    res.status(201).json({
        message: "user registered",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name loginUserController
 * @description login a user
 * @access Public
 */

async function loginUserController(req, res) {
    
    const {email, password} = req.body

    const user = await userModel.findOne({email})

    if(!user) {
        return res.status(400).json({
            message: "invalid credentials"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message: "wrong email pr password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "login success",
        user: {
            id:user._id,
            username:user.username,
            email:user.email 
        }
    })
}

/**
 * @name logoutUserController
 * @description logout a user
 * @access Public
 */
async function logoutUserController(req,res) {
    const token = req.cookies.token

    if(token){
        await tokenBlacklistModel.create({token})
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "user logged out"
    })


}

/**
 * @name getController
 * @description get current user
 * @access Private
 */
async function getMeController(req,res) {
 const user = await userModel.findById(req.user.id)  
 res.status(200).json({
    message: "user fetched",
    user: {
            id:user._id,
            username:user.username,
            email:user.email    
    }
 }) 
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
