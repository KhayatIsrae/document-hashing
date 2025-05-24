const express = require("express")
const router = express.Router()
const controller = require("../controllers/documentController")
const authController = require("../controllers/authController")


router.route("/document")
    .get(controller.get)
    .post(controller.post)

router.route("/signup")
    .post(authController.post)

router.route("/login")
    .post(authController.login)

router.route("/session")
    .get(controller.getSess)

router.route("/logout")
    .get(authController.logout)

router.route("/signup/validateInfo")
    .post(authController.validateInfo)

router.route("/signup/sendOTP")
    .post(authController.sendOTP)

router.route("/signup/validateOTP")
    .post(authController.validateOTP)

module.exports = router
