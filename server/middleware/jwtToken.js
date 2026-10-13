
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { CustomeError } from './globelError.js'
import userModel from'../models/user.model.js'




const generateJwtToken = (data) => {
    return jwt.sign({ id: data.id || data._id, role: data.role }, process.env.JWT_SECRET)
}

const ForgotgenerateJwtToken = (data) => {
    return jwt.sign({ id: data.id || data._id, role: data.role }, process.env.FORGOT_PASSWORD_JWT_SECRET,{ expiresIn: "10m" })

}


const generatehashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest('hex')
}


const verifyjwtAccessToken = async (req, res, next) => {
    try {
        const auth = req.headers.authorization
        if (!auth) {
            return next(CustomeError(401, "Unauthorized"))
        }
        const token = auth.split(" ")[1]

        if (!token) {
            return next(CustomeError(401, "invalid token"))
        }
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!mongoose.isValidObjectId(decodeToken.id)) {
            return next(CustomeError(401, "invalid id"))
        }



        const user = await userModel.findById(decodeToken.id)

        if (!user) {
            return next(CustomeError(401, "invalid token"));
        }

        if (user.status == "block" || user.status == "inactive") {
            await userModel.findByIdAndUpdate(user._id, { accessToken: [] })
            return next(CustomeError(401, "invalid token"));
        }



        const hashaccessToken = generatehashToken(token)
        if (!user.accessToken?.includes(hashaccessToken)) {
            return next(CustomeError(401, "invalid token"));
        }



        if (user) {
            req.user = user,
            req.token = hashaccessToken;
            next()
        } else {
            return next(CustomeError(401, "invalid token"))
        }
    } catch (error) {
        next(error)
    }
}


const optionalJwtAccessToken = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            req.user = null;
            return next();
        }
        const token = auth.split(" ")[1];
        if (!token) {
            req.user = null;
            return next();
        }
        try {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            if (mongoose.isValidObjectId(decodeToken.id)) {
                const user = await userModel.findById(decodeToken.id);
                if (user && user.status !== "block" && user.status !== "inactive") {
                    req.user = user;
                    req.token = generatehashToken(token);
                } else {
                    req.user = null;
                }
            } else {
                req.user = null;
            }
        } catch (_) {
            req.user = null;
        }
        next();
    } catch (error) {
        next(error);
    }
};

export { generateJwtToken, ForgotgenerateJwtToken, generatehashToken, verifyjwtAccessToken, optionalJwtAccessToken, checkRole };