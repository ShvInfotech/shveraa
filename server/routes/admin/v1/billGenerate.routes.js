import express from "express";
import { verifyjwtAccessToken, checkRole } from "../../../middleware/jwtToken.js";
import {
  CreateBill,
  GetAllBills,
  GetBillById,
  DownloadBillPdf,
  DeleteBill,
} from "../../../controllers/admin/v1/billGenerate.controller.js";

const router = express.Router();

// GET /api/v1/admin/bill-generate - Get all generated bills
router.get("/", verifyjwtAccessToken, checkRole("admin"), GetAllBills);

// POST /api/v1/admin/bill-generate - Create a new bill & return bill object
router.post("/", verifyjwtAccessToken, checkRole("admin"), CreateBill);

// GET /api/v1/admin/bill-generate/:id - Get bill details
router.get("/:id", verifyjwtAccessToken, checkRole("admin"), GetBillById);

// GET /api/v1/admin/bill-generate/:id/download - Stream/download PDF invoice
router.get("/:id/download", DownloadBillPdf);

// DELETE /api/v1/admin/bill-generate/:id - Delete a bill record
router.delete("/:id", verifyjwtAccessToken, checkRole("admin"), DeleteBill);

export default router;
