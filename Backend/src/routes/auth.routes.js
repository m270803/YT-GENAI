const express = require('express')
const authRouter = express.Router()
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

/**
 * @route POST /api/auth/register
 * @description register a new user
 * @acess public
 */
authRouter.post("/register",authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description login a user
 * @acess public
 */
authRouter.post("/login",authController.loginUserController)

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie
 * @acess public
 */
authRouter.get("/logout", authController.logoutUserController)

/**
 * @route GET /api/auth/lgetme
 * @description get the current logged in user detail
 * @acess private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController )

module.exports = authRouter;
