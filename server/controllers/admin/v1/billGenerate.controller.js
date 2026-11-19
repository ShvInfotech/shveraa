import BillGenerate from "../../../models/billGenerate.model.js";

// Helper to sanitize strings for WinAnsi PDF encoding
const sanitizeForPdf = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/₹/g, "Rs. ")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .trim();
};

// Format currency
const formatInr = (num) => {
  const val = Number(num) || 0;
  return `Rs. ${val.toFixed(2)}`;
};

// Word wrap helper for PDF
const wrapText = (text, maxChars = 40) => {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxChars) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

/**
 * Generate PDF buffer using pdf-lib
 */
export const buildBillPdfBuffer = async (bill) => {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 portrait

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Palette
  const colorDark = rgb(0.08, 0.09, 0.12);
  const colorGold = rgb(0.72, 0.58, 0.35); // Atelier Luxury Gold
  const colorLightGold = rgb(0.85, 0.74, 0.52);
  const colorTextDark = rgb(0.12, 0.12, 0.15);
  const colorTextMuted = rgb(0.42, 0.44, 0.48);
  const colorBorder = rgb(0.86, 0.86, 0.88);
  const colorTableHeadBg = rgb(0.95, 0.95, 0.96);
  const colorWhite = rgb(1, 1, 1);

  // 1. TOP HEADER BANNER
  page.drawRectangle({
    x: 0,
    y: 730,
    width: 595.28,
    height: 112,
    color: colorDark,
  });

  page.drawRectangle({
    x: 0,
    y: 726,
    width: 595.28,
    height: 4,
    color: colorGold,
  });

  // Brand Name
  page.drawText("SHVERAA JEWELLERY", {
    x: 40,
    y: 790,
    size: 22,
    font: fontBold,
    color: colorLightGold,
  });

  page.drawText("ATELIER & FINE 925 STERLING SILVER", {
    x: 40,
    y: 772,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.8, 0.82),
  });

  page.drawText("Website: www.shveraa.com  |  support@shveraa.luxury", {
    x: 40,
    y: 752,
    size: 8,
    font: fontRegular,
    color: rgb(0.65, 0.65, 0.68),
  });

  // Right Header Text (Tax Invoice)
  page.drawText("TAX INVOICE", {
    x: 390,
    y: 792,
    size: 16,
    font: fontBold,
    color: colorWhite,
  });

  page.drawText("RETAIL BILL OF SALE", {
    x: 390,
    y: 775,
    size: 9,
    font: fontBold,
    color: colorLightGold,
  });

  page.drawText("ORIGINAL COPY FOR RECIPIENT", {
    x: 390,
    y: 755,
    size: 8,
    font: fontRegular,
    color: rgb(0.75, 0.75, 0.78),
  });

  // 2. METADATA & CUSTOMER SECTION
  // Left Column: Customer details
  const leftColX = 40;
  let cursorY = 695;

  page.drawText("BILLED TO (CUSTOMER DETAILS)", {
    x: leftColX,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: colorGold,
  });

  cursorY -= 18;
  page.drawText(sanitizeForPdf(bill.customerName) || "Valued Customer", {
    x: leftColX,
    y: cursorY,
    size: 12,
    font: fontBold,
    color: colorTextDark,
  });

  cursorY -= 15;
  page.drawText(`Phone: ${sanitizeForPdf(bill.customerPhone)}`, {
    x: leftColX,
    y: cursorY,
    size: 9,
    font: fontRegular,
    color: colorTextDark,
  });

  if (bill.customerEmail) {
    cursorY -= 14;
    page.drawText(`Email: ${sanitizeForPdf(bill.customerEmail)}`, {
      x: leftColX,
      y: cursorY,
      size: 9,
      font: fontRegular,
      color: colorTextDark,
    });
  }

  // Address (multiline)
  cursorY -= 14;
  page.drawText("Address:", {
    x: leftColX,
    y: cursorY,
    size: 9,
    font: fontBold,
    color: colorTextDark,
  });

  const addressLines = wrapText(sanitizeForPdf(bill.customerAddress), 38);
  for (const line of addressLines.slice(0, 3)) {
    cursorY -= 12;
    page.drawText(line, {
      x: leftColX,
      y: cursorY,
      size: 8.5,
      font: fontRegular,
      color: colorTextMuted,
    });
  }

  // Right Column: Invoice Details Box
  const rightBoxX = 350;
  const rightBoxY = 600;
  const rightBoxW = 205;
  const rightBoxH = 105;

  page.drawRectangle({
    x: rightBoxX,
    y: rightBoxY,
    width: rightBoxW,
    height: rightBoxH,
    borderColor: colorBorder,
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.99),
  });

  page.drawText("INVOICE SUMMARY", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 18,
    size: 10,
    font: fontBold,
    color: colorGold,
  });

  page.drawText("Invoice Number:", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 36,
    size: 8.5,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText(sanitizeForPdf(bill.invoiceNumber), {
    x: rightBoxX + 90,
    y: rightBoxY + rightBoxH - 36,
    size: 9,
    font: fontBold,
    color: colorTextDark,
  });

  const billDate = new Date(bill.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  page.drawText("Date:", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 52,
    size: 8.5,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText(billDate, {
    x: rightBoxX + 90,
    y: rightBoxY + rightBoxH - 52,
    size: 8.5,
    font: fontRegular,
    color: colorTextDark,
  });

  page.drawText("Payment:", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 68,
    size: 8.5,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText("PREPAID / SETTLED", {
    x: rightBoxX + 90,
    y: rightBoxY + rightBoxH - 68,
    size: 8.5,
    font: fontBold,
    color: rgb(0.15, 0.6, 0.3),
  });

  page.drawText("Status:", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 84,
    size: 8.5,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText("CONFIRMED", {
    x: rightBoxX + 90,
    y: rightBoxY + rightBoxH - 84,
    size: 8.5,
    font: fontBold,
    color: colorTextDark,
  });

  // 3. PRODUCT ITEMS TABLE
  const tableTopY = 560;
  const tableX = 40;
  const tableWidth = 515.28;
  const tableHeaderHeight = 24;

  // Table header background
  page.drawRectangle({
    x: tableX,
    y: tableTopY - tableHeaderHeight,
    width: tableWidth,
    height: tableHeaderHeight,
    color: colorTableHeadBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  // Column Headers
  page.drawText("#", {
    x: tableX + 10,
    y: tableTopY - 16,
    size: 9,
    font: fontBold,
    color: colorDark,
  });
  page.drawText("ITEM DESCRIPTION", {
    x: tableX + 40,
    y: tableTopY - 16,
    size: 9,
    font: fontBold,
    color: colorDark,
  });
  page.drawText("UNIT PRICE", {
    x: tableX + 320,
    y: tableTopY - 16,
    size: 9,
    font: fontBold,
    color: colorDark,
  });
  page.drawText("QTY", {
    x: tableX + 410,
    y: tableTopY - 16,
    size: 9,
    font: fontBold,
    color: colorDark,
  });
  page.drawText("TOTAL", {
    x: tableX + 455,
    y: tableTopY - 16,
    size: 9,
    font: fontBold,
    color: colorDark,
  });

  // Table Row 1 (Product)
  const rowHeight = 36;
  const rowY = tableTopY - tableHeaderHeight - rowHeight;

  page.drawRectangle({
    x: tableX,
    y: rowY,
    width: tableWidth,
    height: rowHeight,
    borderColor: colorBorder,
    borderWidth: 1,
    color: colorWhite,
  });

  // Row Content
  page.drawText("1", {
    x: tableX + 10,
    y: rowY + 18,
    size: 9,
    font: fontRegular,
    color: colorTextDark,
  });

  const prodName = sanitizeForPdf(bill.productName) || "Sterling Silver Jewellery";
  page.drawText(prodName.length > 42 ? prodName.slice(0, 40) + "..." : prodName, {
    x: tableX + 40,
    y: rowY + 20,
    size: 9.5,
    font: fontBold,
    color: colorTextDark,
  });

  page.drawText("Pure 925 Sterling Silver Atelier Certified", {
    x: tableX + 40,
    y: rowY + 8,
    size: 7.5,
    font: fontRegular,
    color: colorTextMuted,
  });

  page.drawText(formatInr(bill.price), {
    x: tableX + 320,
    y: rowY + 16,
    size: 9,
    font: fontRegular,
    color: colorTextDark,
  });

  page.drawText("1", {
    x: tableX + 418,
    y: rowY + 16,
    size: 9,
    font: fontRegular,
    color: colorTextDark,
  });

  page.drawText(formatInr(bill.price), {
    x: tableX + 455,
    y: rowY + 16,
    size: 9.5,
    font: fontBold,
    color: colorTextDark,
  });

  // 4. BREAKDOWN & TOTALS (Right side)
  let calcY = rowY - 25;
  const calcLabelX = 330;
  const calcValX = 455;

  // Subtotal
  page.drawText("Subtotal:", {
    x: calcLabelX,
    y: calcY,
    size: 9,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText(formatInr(bill.price), {
    x: calcValX,
    y: calcY,
    size: 9,
    font: fontRegular,
    color: colorTextDark,
  });

  // Discount (if any)
  calcY -= 18;
  page.drawText("Discount:", {
    x: calcLabelX,
    y: calcY,
    size: 9,
    font: fontRegular,
    color: colorTextMuted,
  });
  const discountVal = Number(bill.discount) || 0;
  page.drawText(discountVal > 0 ? `- ${formatInr(discountVal)}` : "Rs. 0.00", {
    x: calcValX,
    y: calcY,
    size: 9,
    font: fontRegular,
    color: discountVal > 0 ? rgb(0.8, 0.2, 0.2) : colorTextMuted,
  });

  // Shipping Charge (if any)
  calcY -= 18;
  page.drawText("Shipping Charge:", {
    x: calcLabelX,
    y: calcY,
    size: 9,
    font: fontRegular,
    color: colorTextMuted,
  });
  const shippingVal = Number(bill.shippingCharge) || 0;
  page.drawText(shippingVal > 0 ? `+ ${formatInr(shippingVal)}` : "FREE (Rs. 0.00)", {
    x: calcValX,
    y: calcY,
    size: 9,
    font: fontRegular,
    color: shippingVal > 0 ? colorTextDark : rgb(0.15, 0.6, 0.3),
  });

  // Divider Line
  calcY -= 12;
  page.drawLine({
    start: { x: calcLabelX - 10, y: calcY },
    end: { x: tableX + tableWidth, y: calcY },
    thickness: 1,
    color: colorBorder,
  });

  // Total Amount Box
  calcY -= 32;
  page.drawRectangle({
    x: calcLabelX - 10,
    y: calcY,
    width: tableWidth - (calcLabelX - 10 - tableX),
    height: 30,
    color: colorDark,
    borderColor: colorGold,
    borderWidth: 1.5,
  });

  page.drawText("GRAND TOTAL:", {
    x: calcLabelX,
    y: calcY + 9,
    size: 10,
    font: fontBold,
    color: colorLightGold,
  });

  page.drawText(formatInr(bill.totalAmount), {
    x: calcValX - 5,
    y: calcY + 9,
    size: 12,
    font: fontBold,
    color: colorWhite,
  });

  // 5. LEFT SIDE NOTES & AUTHENTICITY BADGE
  const noteBoxX = 40;
  const noteBoxY = calcY - 10;
  const noteBoxW = 260;
  const noteBoxH = 110;

  page.drawRectangle({
    x: noteBoxX,
    y: noteBoxY,
    width: noteBoxW,
    height: noteBoxH,
    borderColor: colorBorder,
    borderWidth: 1,
    color: rgb(0.99, 0.99, 1),
  });

  page.drawText("AUTHENTICITY & ASSURANCE", {
    x: noteBoxX + 12,
    y: noteBoxY + noteBoxH - 18,
    size: 9,
    font: fontBold,
    color: colorGold,
  });

  const notesList = [
    "* Guaranteed 100% 925 Sterling Silver hallmark purity.",
    "* Handcrafted luxury finish with premium rhodium polish.",
    "* Includes comprehensive complimentary atelier warranty.",
    "* Store jewellery in airtight pouches; protect from moisture.",
  ];

  let noteY = noteBoxY + noteBoxH - 34;
  for (const n of notesList) {
    page.drawText(n, {
      x: noteBoxX + 12,
      y: noteY,
      size: 7.5,
      font: fontRegular,
      color: colorTextMuted,
    });
    noteY -= 15;
  }

  // 6. FOOTER
  const footerY = 50;
  page.drawLine({
    start: { x: 40, y: footerY + 25 },
    end: { x: 555.28, y: footerY + 25 },
    thickness: 0.8,
    color: colorBorder,
  });

  page.drawText("Thank you for choosing Shveraa Jewellery.", {
    x: 40,
    y: footerY + 12,
    size: 9,
    font: fontBold,
    color: colorDark,
  });

  page.drawText(
    "This is a verified computer-generated sales invoice and requires no physical signature.",
    {
      x: 40,
      y: footerY,
      size: 7.5,
      font: fontRegular,
      color: colorTextMuted,
    }
  );

  page.drawText("SHVERAA ATELIER INDIA", {
    x: 420,
    y: footerY + 8,
    size: 9,
    font: fontBold,
    color: colorGold,
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
};

/**
 * Controller: Create a new Bill
 * POST /api/v1/admin/bill-generate
 */
export const CreateBill = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      productName,
      price,
      discount = 0,
      shippingCharge = 0,
      notes = "",
    } = req.body;

    // Validate required fields
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }
    if (!customerPhone || !customerPhone.trim()) {
      return res.status(400).json({ success: false, message: "Customer phone number is required" });
    }
    if (!customerAddress || !customerAddress.trim()) {
      return res.status(400).json({ success: false, message: "Customer address is required" });
    }
    if (!productName || !productName.trim()) {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: "Valid price is required" });
    }

    const numPrice = Number(price);
    const numDiscount = Math.max(0, Number(discount) || 0);
    const numShipping = Math.max(0, Number(shippingCharge) || 0);
    const totalAmount = Math.max(0, numPrice - numDiscount + numShipping);

    // Generate unique invoice number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `BILL-${randomSuffix}`;

    const newBill = new BillGenerate({
      invoiceNumber,
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : "",
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      productName: productName.trim(),
      price: numPrice,
      discount: numDiscount,
      shippingCharge: numShipping,
      totalAmount,
      notes: notes ? notes.trim() : "",
    });

    const savedBill = await newBill.save();

    return res.status(201).json({
      success: true,
      message: "Bill generated and saved successfully",
      bill: savedBill,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Get all generated bills
 * GET /api/v1/admin/bill-generate
 */
export const GetAllBills = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query = {
        $or: [
          { invoiceNumber: regex },
          { customerName: regex },
          { customerPhone: regex },
          { customerEmail: regex },
          { productName: regex },
        ],
      };
    }

    const bills = await BillGenerate.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Get single bill by ID
 * GET /api/v1/admin/bill-generate/:id
 */
export const GetBillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bill = await BillGenerate.findById(id);

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    return res.status(200).json({ success: true, bill });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Download Bill PDF
 * GET /api/v1/admin/bill-generate/:id/download
 */
export const DownloadBillPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bill = await BillGenerate.findById(id);

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    const pdfBuffer = await buildBillPdfBuffer(bill);

    const safeFilename = `Invoice-${bill.invoiceNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Delete a generated bill
 * DELETE /api/v1/admin/bill-generate/:id
 */
export const DeleteBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await BillGenerate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Bill record deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
