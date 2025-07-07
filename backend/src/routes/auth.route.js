import express from 'express';
import { login, signup, logout, onboard,me } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/onboarding").post(protectRoute, onboard);
router.route("/me").get(protectRoute,me);



export default router;
