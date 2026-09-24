import express from "express";
import { Pincodedetails } from "../../../controllers/user/v1/delhivery.controller.js";
const router = express.Router()

router.get('/get-pincode-details/:pincode',Pincodedetails)


export default router
