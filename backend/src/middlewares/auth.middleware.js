import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../libs/ApiError.js";

export const protectRoute = async (req, res, next) => {
   try {
     const token = req.cookies.jwt;
 
     if (!token) {
          throw new ApiError(401, "You are not authorized");
     }
     
     const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
     if (!decode) {
         throw new ApiError(401, "You are not authorizedd");
     }
 
     const user = await User.findById(decode.userId).select("-password -__v");
     if (!user) {
         throw new ApiError(404, "User not found");
     }
     req.user = user;
     next();
   } catch (error) {
       console.log("Error in protectRoute middleware:", error.message);
       res.status(500)
              .json(new ApiError(500, "Internal server error"));
       
    
   }
}