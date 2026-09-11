import path from 'path'; 
import fs from 'fs'
import bcrypt from 'bcrypt'
import { getMessaging } from 'firebase-admin/messaging';
import firebaseadmin from '../config/firebase.js';


export const hashUserPassword = (password)=>{
      return bcrypt.hash(password,12)
}


export const DeleteImage = (filepath) => {
    try {
        const deletepath = path.join(__dirname, "..", filepath)
        if (fs.existsSync(deletepath)) {
            fs.unlinkSync(deletepath)
        }
    } catch (error) {
        console.log("image delete error:", error)
    }

}






export const sendNotification = async (deviceTokens, title, body) => {
    try {
        if (!Array.isArray(deviceTokens) || deviceTokens.length === 0) {
            return;
        }

        const messaging = getMessaging(firebaseadmin);

        const res = await messaging.sendEachForMulticast({
            tokens: deviceTokens,

            notification: {
                title,
                body,
            },

            webpush: {
                notification: {
                    icon: "https://res.cloudinary.com/dblxejpyp/image/upload/v1788841967/nehdo-logo.png",
                },
            },
        });
        console.log("Success:", res.successCount);
        console.log("Failed:", res.failureCount);

        // Invalid / expired tokens
        const invalidTokens = [];

        res.responses.forEach((response, index) => {
            if (!response.success) {
                const errorCode = response.error?.code;
                if (errorCode === "messaging/registration-token-not-registered" || errorCode === "messaging/invalid-registration-token") {
                    invalidTokens.push(deviceTokens[index]);
                }
            }
        });

        console.log("Invalid tokens:", invalidTokens);


        if (invalidTokens && invalidTokens.length) {
            await userModel.updateMany(
                { deviceToken: { $in: invalidTokens } },
                { $pull: { deviceToken: { $in: invalidTokens } } }
            );
        }
        return {
            res,
            invalidTokens
        }

    } catch (error) {
        console.log("FCM Error:", error);
    }
};
















