import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import ApiError from '../libs/ApiError.js';

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
         
        },
        email: {
            type: String,
            required: true,
            unique: true,
          
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        bio: {
            type: String,
            maxlength: 160,
            default: '',
        },
        profilePic: {
            type: String,
            default: '',
        },
        nativeLanguage: {
            type: String,
            default: '',
        },
        learningLanguage: {
            type: String,
            default: '',
        },
        location: {
            type: String,
            default: '',
        },  
        isOnboarded: {
            type: Boolean,
            default: false,
        },

        friends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
    timestamps: true,
    }
);


//pre hook
// Hash the password before saving the user

userSchema.pre('save', async function (next) {

    if (!this.isModified('password'))  return next();
       

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
       return ApiError('Error hashing password', 500, error);
    }

});

userSchema.methods.matchPassword = async function (enteredPassword) {
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
    return isPasswordCorrect;
};


const User = mongoose.model('User', userSchema);


export default User;