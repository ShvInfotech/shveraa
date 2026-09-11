import sendEmail from '../../../config/nodemailer.confing.js'
import { ForgetPasswordMail } from '../../../helper/emailTemplate.js'
import { DeleteImage, hashUserPassword } from '../../../helper/helper.js'
import { CustomeError } from '../../../middleware/globelError.js'
import { ForgotgenerateJwtToken, generatehashToken, generateJwtToken } from '../../../middleware/jwtToken.js'
import UserModel from '../../../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'



export const UserRegister = async (req, res, next) => {
    try {

        const { name, email, phone, password, deviceToken } = req.body || {}

        if (!name) {
            return next(CustomeError(422, 'name is required'))
        }


        if (!email) {
            return next(CustomeError(422, 'email is required'))
        }

        if (!phone) {
            return next(CustomeError(422, 'contact number is required'))
        }

        if (!password) {
            return next(CustomeError(422, 'password is required'))
        }


        const hashPassword = await hashUserPassword(password)
        console.log(hashPassword)
        const userData = {
            name,
            email,
            phone,
            password: hashPassword
        }


        let user = await UserModel.create(userData)

        const token = generateJwtToken(user)
        const hashAccessToken = generatehashToken(token)



        const updateData = { $addToSet: { accessToken: hashAccessToken } };

        if (deviceToken) {
            updateData.$addToSet.deviceToken = deviceToken;
        }

        user = await UserModel.findByIdAndUpdate(user._id, updateData, { returnDocument: 'after' }).select('name email contact profile createdAt')


        return res.status(200).json({ success: true, message: "User Register", user, AccessToken: token })
    } catch (error) {
        return next(error)
    }
}


export const UserLogin = async (req, res, next) => {
    try {
        const { email, password, deviceToken } = req.body || {}

        if (!email) {
            return next(CustomeError(422, "email is required"))
        }

        if (!password) {
            return next(CustomeError(422, "password is required"))
        }

        let user = await UserModel.findOne({ email: email})

        if (!user) {
            return next(CustomeError(404, "User Not Found"))
        }

        if(user.status == "inactive" || user.status == "block"){
            return next(CustomeError(401,"Your Account is Inactive or Block"))
        }

        const matchPassword = await bcrypt.compare(password, user.password)

        if (!matchPassword) {
            return next(CustomeError(403, "Invalid  Password"))
        }

        const token = generateJwtToken(user)
        const hashAccessToken = generatehashToken(token)



        const updateData = { $addToSet: { accessToken: hashAccessToken } };

        if (deviceToken) {
            updateData.$addToSet.deviceToken = deviceToken;
        }

        user = await UserModel.findByIdAndUpdate(user._id, updateData, { returnDocument: 'after' }).select('name email contact profile createdAt')


        return res.status(200).json({ success: true, message: "User Register", user, AccessToken: token })


    } catch (error) {
        return next(error)
    }
}

export const UserLogout = async (req, res, next) => {
    try {
        const token = req.token

        if (token) {
            await UserModel.findByIdAndUpdate(req.user._id, { $pull: { accessToken: token } }, { returnDocument: "after" })
        }

        return res.status(200).json({ success: true, message: 'User Logout', token })
    } catch (error) {
        return next(error)
    }
}

export const UserForgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body

        if (!email) {
            return next(CustomeError(422, 'Enter Your Register Email'))
        }

        const user = await UserModel.findOne({ email: email, status: 'active' })

        if (!user) {
            return next(CustomeError(404, "Inavlid Email Enter Your Register Email"))
        }


        const token = ForgotgenerateJwtToken(user)

        const link = `${process.env.BACKEND_DOMIN_URL}/reset-password/${token}`

        await sendEmail(ForgetPasswordMail(user.email, user.name, link))

        return res.status(200).json({ success: true, message: "Reset Password Link Sent Your Register Email" })

    } catch (error) {
        return next(error)
    }
}


export const ResetPasswordpage = async (req, res, next) => {
    try {
        const token = req.params.token
        res.render('reset-password', { token, message: "", type: "" })
    } catch (error) {
        return next(error)
    }
}


export const ResetPassword = async (req, res, next) => {

    try {

        const token = req.params.token;
        const { password } = req.body;

        if(!password){
            return res.render("reset-password", {
                token: token,
                message: "Password Is Required.",
                type: "error"
            });
        }

        const decoded = jwt.verify(token, process.env.FORGOT_PASSWORD_JWT_SECRET);
        const userId = decoded.id;


        // 2. hash password
        const hashPassword = await bcrypt.hash(password, 12);

        await UserModel.findByIdAndUpdate(userId, { password: hashPassword, accessToken: [] });
        return res.render("reset-password", {
            token,
            message: "Password updated successfully",
            type: "success"
        });

    } catch (error) {
        console.log(error)
        if (error.name === "TokenExpiredError") {
            return res.render("reset-password", {
                token: null,
                message: "Your reset password link has expired. Please request a new one.",
                type: "expired"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.render("reset-password", {
                token: null,
                message: "Invalid reset password link.",
                type: "error"
            });
        }
        return next(error);
    }
};

export const UserUpdateProfile = async (req,res,next) =>{
    try {
        const userId = req.user._id

        let user = await UserModel.findById(userId)

        if(!user){
            return next(CustomeError(401,'User Not Found'))
        }
        let profile = user.profile
        if(req.file){
            if(profile !==""){
                DeleteImage(user.profile)
            }
            profile = `/uploads/${req.file.fieldname}/${req.file.filename}`
        }
    } catch (error) {
        return next(error)
    }
}