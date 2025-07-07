import ApiResponse from "../libs/ApiResponse.js";
import { upsertStreamUser } from "../libs/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {

    const { email, password, fullName } = req.body;



    try {
        if (!email || !password || !fullName) {
            return res.status(400)
                .json(new ApiResponse(400, null, "All fields are required"));
        }

        if (password.length < 6) {
            return res.status(400)
                .json(new ApiResponse(400, null, "Password must be at least 6 characters long"));
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400)
                .json(new ApiResponse(400, null, "Invalid email format"));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400)
                .json(new ApiResponse(400, null, "Email already exists"));
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            password,
            fullName,
            profilePic: randomAvatar
        });

        if (!newUser) {
            return res.status(500)
                .json(new ApiResponse(500, null, "Failed to create user"));
        }

    try {
            await upsertStreamUser({
                id : newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
            console.log(`stream user created: ${newUser.fullName}`);
        } catch (error) {
            console.error("Error creating Stream user:", error);
        }


        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        })
        res.status(201)
            .json(new ApiResponse(201, { user: newUser, token }, "User created successfully"));




    }
    catch (error) {
        res.status(500)
            .json(new ApiResponse(500, null, "Internal server error"));
        console.error("Error during signup:", error);
    }

}



export async function login(req, res) {
  try {
      const { email, password } = req.body;
       
      if (!email || !password) {
          return res.status(400)
              .json(new ApiResponse(400, null, "Email and password are required"));
      }
      const user = await User.findOne({ email });
      if (!user) {
            return res.status(401)
                .json(new ApiResponse(401, null, "Invalid email or password"));
      }
       
      const isPasswordCorrect = await user.matchPassword(password);
      if (!isPasswordCorrect) {
          return res.status(401)
              .json(new ApiResponse(401, null, "Invalid email or password"));
      }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });     
      
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200)
            .json(new ApiResponse(200, { user, token }, "Login successful"));

  } catch (error) {
      console.log("Error during login:", error.message);
        res.status(500)
            .json(new ApiResponse(500, null, "Internal server error"));
      
  }

}



export async function logout(req, res) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.json({message: "You are not logged in"});
    }
    res.clearCookie("jwt");

    res.status(200)
        .json(new ApiResponse(200, null, "Logout successful"));
}

export async function onboard(req, res) {
       try {
           const userId = req.user._id;
           const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

           if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
               return res.status(400)
                   .json({
                       message: "All fields are required",
                       missingFields: [
                           !fullName && "fullName",
                           !bio && "bio",
                           !nativeLanguage && "nativeLanguage",
                           !learningLanguage && "learningLanguage",
                           !location && "location"
                          ].filter(Boolean)
                   });
           }

           const updatedUser = await User.findByIdAndUpdate(userId, {
               ...req.body,
               isOnboarded: true
           }, { new: true });

           if (!updatedUser) {
               return res.status(404)
                   .json(new ApiResponse(404, null, "User not found"));
           }

           try {
               await upsertStreamUser({
                   id: updatedUser._id.toString(),
                   name: updatedUser.fullName,
                   image: updatedUser.profilePic || "",
               })
                console.log(`Stream user updated: ${updatedUser.fullName}`);
             }catch(streamError) {
                 console.error("Error updating Stream user:", streamError);
             }

           res.status(200)
               .json(new ApiResponse(200, { user: updatedUser }, "User onboarded successfully"));
       } catch (error) {
              console.error("Error during onboarding:", error);
              res.status(500)
                .json(new ApiResponse(500, null, "Internal server error"));
       }
    
}

export async function me(req, res) {
    try {
       
        
        
        return res.status(200).json({ success: true, user: req.user });
       
        
        
    }
    catch (error) {
        console.log("me not founded");
        
    }
}