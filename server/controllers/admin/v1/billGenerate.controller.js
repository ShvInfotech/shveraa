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
 * Supports multiple products, percentage/fixed discount,
 * custom phone (+91 99980 46559), email (shvera925@gmail.com), and hallmark number (123456789123456789)
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

  const officialPhone = "+91 99980 46559";
  const officialEmail = "shvera925@gmail.com";
  const hallmarkNo = bill.hallmarkNumber || "123456789123456789";

  // 1. TOP HEADER BANNER
  page.drawRectangle({
    x: 0,
    y: 725,
    width: 595.28,
    height: 117,
    color: colorDark,
  });

  page.drawRectangle({
    x: 0,
    y: 721,
    width: 595.28,
    height: 4,
    color: colorGold,
  });

  // Brand Name
  page.drawText("SHVERAA JEWELLERY", {
    x: 40,
    y: 795,
    size: 22,
    font: fontBold,
    color: colorLightGold,
  });

  page.drawText("ATELIER & FINE 925 STERLING SILVER", {
    x: 40,
    y: 778,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.8, 0.82),
  });

  page.drawText(`Phone: ${officialPhone}  |  Email: ${officialEmail}`, {
    x: 40,
    y: 758,
    size: 8,
    font: fontRegular,
    color: rgb(0.75, 0.75, 0.78),
  });

  page.drawText(`Website: www.shveraa.com  |  BIS Hallmark UID: ${hallmarkNo}`, {
    x: 40,
    y: 742,
    size: 8,
    font: fontBold,
    color: colorLightGold,
  });

  // Right Header Text (Tax Invoice)
  page.drawText("TAX INVOICE", {
    x: 390,
    y: 795,
    size: 16,
    font: fontBold,
    color: colorWhite,
  });

  page.drawText("RETAIL BILL OF SALE", {
    x: 390,
    y: 778,
    size: 9,
    font: fontBold,
    color: colorLightGold,
  });

  page.drawText("ORIGINAL COPY FOR RECIPIENT", {
    x: 390,
    y: 758,
    size: 8,
    font: fontRegular,
    color: rgb(0.75, 0.75, 0.78),
  });

  // 2. METADATA & CUSTOMER SECTION
  const leftColX = 40;
  let cursorY = 690;

  page.drawText("BILLED TO (CUSTOMER DETAILS)", {
    x: leftColX,
    y: cursorY,
    size: 9.5,
    font: fontBold,
    color: colorGold,
  });

  cursorY -= 17;
  page.drawText(sanitizeForPdf(bill.customerName) || "Valued Customer", {
    x: leftColX,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: colorTextDark,
  });

  cursorY -= 14;
  page.drawText(`Phone: ${sanitizeForPdf(bill.customerPhone)}`, {
    x: leftColX,
    y: cursorY,
    size: 8.5,
    font: fontRegular,
    color: colorTextDark,
  });

  if (bill.customerEmail) {
    cursorY -= 13;
    page.drawText(`Email: ${sanitizeForPdf(bill.customerEmail)}`, {
      x: leftColX,
      y: cursorY,
      size: 8.5,
      font: fontRegular,
      color: colorTextDark,
    });
  }

  // Address (multiline)
  cursorY -= 13;
  page.drawText("Address:", {
    x: leftColX,
    y: cursorY,
    size: 8.5,
    font: fontBold,
    color: colorTextDark,
  });

  const addressLines = wrapText(sanitizeForPdf(bill.customerAddress), 38);
  for (const line of addressLines.slice(0, 3)) {
    cursorY -= 11;
    page.drawText(line, {
      x: leftColX,
      y: cursorY,
      size: 8,
      font: fontRegular,
      color: colorTextMuted,
    });
  }

  // Right Column: Invoice Details Box
  const rightBoxX = 345;
  const rightBoxY = 590;
  const rightBoxW = 210;
  const rightBoxH = 110;

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
    y: rightBoxY + rightBoxH - 17,
    size: 9.5,
    font: fontBold,
    color: colorGold,
  });

  page.drawText("Invoice Number:", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 33,
    size: 8,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText(sanitizeForPdf(bill.invoiceNumber), {
    x: rightBoxX + 85,
    y: rightBoxY + rightBoxH - 33,
    size: 8.5,
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
    y: rightBoxY + rightBoxH - 49,
    size: 8,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText(billDate, {
    x: rightBoxX + 85,
    y: rightBoxY + rightBoxH - 49,
    size: 8,
    font: fontRegular,
    color: colorTextDark,
  });

  page.drawText("Hallmark UID:", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 65,
    size: 8,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText(sanitizeForPdf(hallmarkNo), {
    x: rightBoxX + 85,
    y: rightBoxY + rightBoxH - 65,
    size: 8,
    font: fontBold,
    color: colorGold,
  });

  page.drawText("Payment:", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 81,
    size: 8,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText("PREPAID / SETTLED", {
    x: rightBoxX + 85,
    y: rightBoxY + rightBoxH - 81,
    size: 8,
    font: fontBold,
    color: rgb(0.15, 0.6, 0.3),
  });

  page.drawText("Status:", {
    x: rightBoxX + 12,
    y: rightBoxY + rightBoxH - 97,
    size: 8,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText("CONFIRMED", {
    x: rightBoxX + 85,
    y: rightBoxY + rightBoxH - 97,
    size: 8,
    font: fontBold,
    color: colorTextDark,
  });

  // 3. PRODUCT ITEMS TABLE (MULTIPLE PRODUCTS)
  const itemsList =
    bill.items && bill.items.length > 0
      ? bill.items
      : [
          {
            productName: bill.productName,
            price: bill.price,
            quantity: 1,
            total: bill.price,
          },
        ];

  const tableTopY = 555;
  const tableX = 40;
  const tableWidth = 515.28;
  const tableHeaderHeight = 22;

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
    x: tableX + 8,
    y: tableTopY - 15,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });
  page.drawText("ITEM DESCRIPTION", {
    x: tableX + 35,
    y: tableTopY - 15,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });
  page.drawText("UNIT PRICE", {
    x: tableX + 315,
    y: tableTopY - 15,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });
  page.drawText("QTY", {
    x: tableX + 410,
    y: tableTopY - 15,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });
  page.drawText("TOTAL", {
    x: tableX + 455,
    y: tableTopY - 15,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  // Draw Items Rows
  const rowHeight = 26;
  let currentRowY = tableTopY - tableHeaderHeight;

  itemsList.forEach((item, index) => {
    currentRowY -= rowHeight;

    // Alternating row background
    if (index % 2 === 1) {
      page.drawRectangle({
        x: tableX,
        y: currentRowY,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.99, 0.99, 1),
      });
    }

    // Row border line
    page.drawRectangle({
      x: tableX,
      y: currentRowY,
      width: tableWidth,
      height: rowHeight,
      borderColor: colorBorder,
      borderWidth: 0.5,
    });

    // Col 1: Index
    page.drawText(String(index + 1), {
      x: tableX + 10,
      y: currentRowY + 9,
      size: 8.5,
      font: fontRegular,
      color: colorTextDark,
    });

    // Col 2: Product Name
    const rawProd = sanitizeForPdf(item.productName) || "Sterling Silver Jewellery";
    const prodDisplay = rawProd.length > 44 ? rawProd.slice(0, 42) + "..." : rawProd;
    page.drawText(prodDisplay, {
      x: tableX + 35,
      y: currentRowY + 9,
      size: 8.5,
      font: fontBold,
      color: colorTextDark,
    });

    // Col 3: Unit Price
    page.drawText(formatInr(item.price), {
      x: tableX + 315,
      y: currentRowY + 9,
      size: 8.5,
      font: fontRegular,
      color: colorTextDark,
    });

    // Col 4: Quantity
    page.drawText(String(item.quantity || 1), {
      x: tableX + 415,
      y: currentRowY + 9,
      size: 8.5,
      font: fontRegular,
      color: colorTextDark,
    });

    // Col 5: Total
    const lineTotal = item.total !== undefined ? item.total : (Number(item.price) || 0) * (Number(item.quantity) || 1);
    page.drawText(formatInr(lineTotal), {
      x: tableX + 455,
      y: currentRowY + 9,
      size: 8.5,
      font: fontBold,
      color: colorTextDark,
    });
  });

  // 4. BREAKDOWN & TOTALS (Right side)
  let calcY = currentRowY - 22;
  const calcLabelX = 320;
  const calcValX = 455;

  const subtotalVal = bill.subtotal !== undefined && bill.subtotal !== null
    ? Number(bill.subtotal)
    : itemsList.reduce((acc, it) => acc + (it.total || (Number(it.price) * (Number(it.quantity) || 1))), 0);

  // Subtotal
  page.drawText("Subtotal:", {
    x: calcLabelX,
    y: calcY,
    size: 8.5,
    font: fontRegular,
    color: colorTextMuted,
  });
  page.drawText(formatInr(subtotalVal), {
    x: calcValX,
    y: calcY,
    size: 8.5,
    font: fontRegular,
    color: colorTextDark,
  });

  // Discount (if any)
  calcY -= 16;
  const discountVal = Number(bill.discount) || 0;
  const discountLabel =
    bill.discountType === "percentage" && bill.discountValue
      ? `Discount (${bill.discountValue}%):`
      : "Discount:";

  page.drawText(discountLabel, {
    x: calcLabelX,
    y: calcY,
    size: 8.5,
    font: fontRegular,
    color: colorTextMuted,
  });

  page.drawText(discountVal > 0 ? `- ${formatInr(discountVal)}` : "Rs. 0.00", {
    x: calcValX,
    y: calcY,
    size: 8.5,
    font: fontRegular,
    color: discountVal > 0 ? rgb(0.8, 0.2, 0.2) : colorTextMuted,
  });

  // Shipping Charge (if any)
  calcY -= 16;
  page.drawText("Shipping Charge:", {
    x: calcLabelX,
    y: calcY,
    size: 8.5,
    font: fontRegular,
    color: colorTextMuted,
  });
  const shippingVal = Number(bill.shippingCharge) || 0;
  page.drawText(shippingVal > 0 ? `+ ${formatInr(shippingVal)}` : "FREE (Rs. 0.00)", {
    x: calcValX,
    y: calcY,
    size: 8.5,
    font: fontRegular,
    color: shippingVal > 0 ? colorTextDark : rgb(0.15, 0.6, 0.3),
  });

  // Divider Line
  calcY -= 10;
  page.drawLine({
    start: { x: calcLabelX - 10, y: calcY },
    end: { x: tableX + tableWidth, y: calcY },
    thickness: 1,
    color: colorBorder,
  });

  // Total Amount Box
  calcY -= 30;
  page.drawRectangle({
    x: calcLabelX - 10,
    y: calcY,
    width: tableWidth - (calcLabelX - 10 - tableX),
    height: 28,
    color: colorDark,
    borderColor: colorGold,
    borderWidth: 1.5,
  });

  page.drawText("GRAND TOTAL:", {
    x: calcLabelX,
    y: calcY + 8,
    size: 9.5,
    font: fontBold,
    color: colorLightGold,
  });

  page.drawText(formatInr(bill.totalAmount), {
    x: calcValX - 5,
    y: calcY + 8,
    size: 11,
    font: fontBold,
    color: colorWhite,
  });

  // 5. LEFT SIDE NOTES & AUTHENTICITY BADGE
  const noteBoxX = 40;
  const noteBoxY = Math.max(90, calcY - 10);
  const noteBoxW = 260;
  const noteBoxH = 100;

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
    y: noteBoxY + noteBoxH - 16,
    size: 8.5,
    font: fontBold,
    color: colorGold,
  });

  const notesList = [
    `* BIS Hallmark License / UID: ${hallmarkNo}`,
    "* Guaranteed 100% 925 Sterling Silver hallmark purity.",
    `* Official Support: ${officialPhone} | ${officialEmail}`,
    "* Includes complimentary atelier warranty against manufacturing defect.",
    "* Store jewellery in airtight pouches; keep away from water/perfumes.",
  ];

  let noteY = noteBoxY + noteBoxH - 30;
  for (const n of notesList) {
    page.drawText(n, {
      x: noteBoxX + 12,
      y: noteY,
      size: 7,
      font: fontRegular,
      color: colorTextMuted,
    });
    noteY -= 13;
  }

  // 6. FOOTER
  const footerY = 40;
  page.drawLine({
    start: { x: 40, y: footerY + 22 },
    end: { x: 555.28, y: footerY + 22 },
    thickness: 0.8,
    color: colorBorder,
  });

  page.drawText("Thank you for choosing Shveraa Jewellery.", {
    x: 40,
    y: footerY + 10,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  page.drawText(
    `Official Helpline: ${officialPhone} | Email: ${officialEmail} | Hallmark UID: ${hallmarkNo}`,
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
    size: 8.5,
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
      customerEmail = "",
      customerPhone,
      customerAddress,
      // Multiple items array
      items = [],
      // Fallback single product fields
      productName,
      price,
      // Discount
      discountType = "fixed", // "fixed" | "percentage"
      discountValue = 0,
      discount = 0,
      shippingCharge = 0,
      hallmarkNumber = "123456789123456789",
      notes = "",
    } = req.body;

    // Validate customer details
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }
    if (!customerPhone || !customerPhone.trim()) {
      return res.status(400).json({ success: false, message: "Customer phone number is required" });
    }
    if (!customerAddress || !customerAddress.trim()) {
      return res.status(400).json({ success: false, message: "Customer address is required" });
    }

    // Parse and validate items (supports multiple products or fallback single)
    let parsedItems = [];
    if (Array.isArray(items) && items.length > 0) {
      parsedItems = items
        .map((it) => {
          const itemPrice = Math.max(0, Number(it.price) || 0);
          const itemQty = Math.max(1, Number(it.quantity) || 1);
          return {
            productName: String(it.productName || "").trim(),
            price: itemPrice,
            quantity: itemQty,
            total: Math.round(itemPrice * itemQty * 100) / 100,
          };
        })
        .filter((it) => it.productName.length > 0);
    }

    // Fallback if no items array was passed but productName & price were
    if (parsedItems.length === 0 && productName && productName.trim()) {
      const singlePrice = Math.max(0, Number(price) || 0);
      parsedItems.push({
        productName: productName.trim(),
        price: singlePrice,
        quantity: 1,
        total: singlePrice,
      });
    }

    if (parsedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product with name and price is required",
      });
    }

    // Calculate subtotal
    const subtotal = parsedItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate discount based on fixed or percentage
    const dVal = Math.max(0, Number(discountValue || discount) || 0);
    let calculatedDiscount = 0;
    if (discountType === "percentage") {
      calculatedDiscount = Math.round(((subtotal * dVal) / 100) * 100) / 100;
    } else {
      calculatedDiscount = dVal;
    }
    // Cap discount at subtotal
    calculatedDiscount = Math.min(subtotal, Math.max(0, calculatedDiscount));

    const numShipping = Math.max(0, Number(shippingCharge) || 0);
    const totalAmount = Math.max(0, Math.round((subtotal - calculatedDiscount + numShipping) * 100) / 100);

    // Summary productName and price for table display and backward compatibility
    const summaryProductName =
      parsedItems.length === 1
        ? parsedItems[0].productName
        : `${parsedItems[0].productName} (+${parsedItems.length - 1} more)`;

    // Generate unique invoice number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `BILL-${randomSuffix}`;

    const newBill = new BillGenerate({
      invoiceNumber,
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : "",
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: parsedItems,
      productName: summaryProductName,
      price: subtotal,
      subtotal,
      discountType: discountType === "percentage" ? "percentage" : "fixed",
      discountValue: dVal,
      discount: calculatedDiscount,
      shippingCharge: numShipping,
      totalAmount,
      hallmarkNumber: hallmarkNumber.trim() || "123456789123456789",
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
          { "items.productName": regex },
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
