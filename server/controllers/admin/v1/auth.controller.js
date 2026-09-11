import { CustomeError } from "../../../middleware/globelError.js"
import { generatehashToken, generateJwtToken } from "../../../middleware/jwtToken.js"
import UserModel from "../../../models/user.model.js"
import bcrypt from "bcrypt"



export const AdminLogin = async (req,res,next)=>{
    try {

         const {email,password,deviceToken} = req.body || {}

         if(!email){
            return next(CustomeError(422,"Email is Required"))
         }

         if(!password){
            return next(CustomeError(422,"Password is Required"))
         }

         let admin = await UserModel.findOne({email:email,role:'admin'})

         if(!admin){
            return next(CustomeError(404,"Admin Not Found"))
         }

         const matchPassword = bcrypt.compare(password,admin.password)
         if(!matchPassword){
            return next(CustomeError(403,"password not match"))
         }

        const token = generateJwtToken(admin)
        const hashAccessToken = generatehashToken(token)



        const updateData = { $addToSet: { accessToken: hashAccessToken } };

        if (deviceToken) {
            updateData.$addToSet.deviceToken = deviceToken;
        }

        admin = await UserModel.findByIdAndUpdate(admin._id, updateData, { returnDocument: 'after' }).select('name email contact profile createdAt')


        return res.status(200).json({ success: true, message: "User Register", admin, AccessToken: token })
        
    } catch (error) {
       return next(error) 
    }
} 



export const AdminLogout = async (req, res, next) => {
    try {
        const token = req.token

        if (token) {
            await UserModel.findByIdAndUpdate(req.user._id, { $pull: { accessToken: token } }, { returnDocument: "after" })
        }

        return res.status(200).json({ success: true, message: 'Logout' })
    } catch (error) {
        return next(error)
    }
}