import path from 'path';
import fs from 'fs'
import bcrypt from 'bcrypt'
import { getMessaging } from 'firebase-admin/messaging';
import firebaseadmin from '../config/firebase.js';
import userModel from '../models/user.model.js';
import { PDFDocument } from "pdf-lib";


export const hashUserPassword = (password) => {
    return bcrypt.hash(password, 12)
}


export const DeleteImage = (filepath) => {
    try {
        if (!filepath || typeof filepath !== 'string') return;
        // Strip backend domain prefix if present
        let cleanPath = filepath.replace(/^https?:\/\/[^\/]+/, '');
        if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
        const deletepath = path.join(process.cwd(), cleanPath);
        if (fs.existsSync(deletepath)) {
            fs.unlinkSync(deletepath);
            console.log("Deleted image:", deletepath);
        }
    } catch (error) {
        console.log("image delete error:", error);
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
                    icon: "https://res.cloudinary.com/dblxejpyp/image/upload/v1790678167/logo.png",
                },
            },
        });


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



export const SendWahtsappMessage = async (number, message) => {
    try {
        // http://localhost:3000/api/send?number=91XXXXXXXXXX&type=text&message=Hello&instance_id=7D5FAC65E40A7&access_token=f8ceca21b637dd9d54c28968

        const response = await fetch(`http://localhost:3000/api/send?number=91${number}&type=text&message=${message}&instance_id=7D5FAC65E40A7&access_token=f8ceca21b637dd9d54c28968`, {
            method: "GET",
        });


        const data = await response.json();
        console.log(data)
    } catch (error) {
        console.log(error)
    }
}








export const mergeLabelPDFs = async (packages = []) => {
  const mergedPdf = await PDFDocument.create();

  for (const pkg of packages) {
    if (!pkg.pdf_encoding) continue;

    const pdfBytes = Buffer.from(pkg.pdf_encoding, "base64");
    const pdf = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(
      pdf,
      pdf.getPageIndices()
    );

    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
};













