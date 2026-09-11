import express from "express";
import { AddCategory } from "../../../controllers/admin/v1/categoris.controller.js";
const router = express.Router()

router.post('/add',AddCategory)

export default router