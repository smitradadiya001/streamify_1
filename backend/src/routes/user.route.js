import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getMyFriends, getRecommendedUser,sendFriendRequest,acceptFriendRequest, getFriendRequests,getOutgoingFriendRequests} from '../controllers/user.controller.js';
import { get } from 'mongoose';

const router = express.Router();

router.use(protectRoute);

router.route("/").get(getRecommendedUser);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;






