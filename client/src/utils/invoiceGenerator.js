import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Helper: Convert number to Indian Currency Words
export const numberToWords = (num) => {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  };

  let n = Math.floor(num);
  let str = '';
  if (n >= 10000000) {
    str += inWords(Math.floor(n / 10000000)) + ' Crore ';
    n %= 10000000;
  }
  if (n >= 100000) {
    str += inWords(Math.floor(n / 100000)) + ' Lakh ';
    n %= 100000;
  }
  if (n >= 1000) {
    str += inWords(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }
  if (n >= 100) {
    str += inWords(Math.floor(n / 100)) + ' Hundred ';
    n %= 100;
  }
  if (n > 0) {
    str += (str ? 'and ' : '') + inWords(n) + ' ';
  }
  return `INR ${str.trim()} Rupees Only`;
};

// Generate Full Clean HTML for Shveraa 925 Sterling Silver Tax Invoice
export const generateInvoiceHTML = (order, user = {}) => {
  const orderRef = order?.orderNumber || order?._id || 'SHV-ORD';
  const invoiceNo = `INV-${String(orderRef).replace(/[^a-zA-Z0-9]/g, '')}`;
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const customerName = order?.address?.name || user?.name || 'Valued Patron';
  const customerPhone = order?.address?.phone || user?.phone || '+91 99980 46559';
  const customerEmail = user?.email || 'patron@shveraa.luxury';
  
  const addrObj = order?.address || {};
  const fullAddress = [
    addrObj.addressline || addrObj.street,
    addrObj.locality,
    addrObj.city,
    addrObj.state,
    addrObj.pincode,
  ].filter(Boolean).join(', ') || 'Address recorded with Shveraa Atelier';

  const items = Array.isArray(order?.items) ? order.items : [];
  const subtotal = Number(order?.amount || items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0));
  const discount = Number(order?.discount || 0);
  const shippingCharges = Number(order?.shippingcharges || 0);
  const grandTotal = Number(order?.totalAmount || (subtotal - discount + shippingCharges));
  
  // 3% GST (Jewellery standard: 1.5% CGST + 1.5% SGST)
  const gstAmount = Math.round((grandTotal * 3) / 103);
  const taxableValue = grandTotal - gstAmount;
  const halfGst = (gstAmount / 2).toFixed(2);

  const paymentMethod = order?.payment?.method === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid';
  const paymentStatus = (order?.payment?.status || 'pending').toUpperCase();
  const paymentTxnId = order?.payment?.paymentId || order?.payment?.orderId || 'Direct Atelier Settlement';
  const waybill = order?.waybill || 'Assigned on Dispatch';

  return `
    <div id="shv-invoice-document" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      width: 794px;
      margin: 0 auto;
      background: #FFFFFF;
      color: #18181B;
      padding: 36px 44px;
      box-sizing: border-box;
      line-height: 1.45;
      font-size: 13px;
      position: relative;
    ">
      <!-- Watermark Seal -->
      <div style="
        position: absolute;
        top: 48%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-25deg);
        font-size: 80px;
        font-weight: 800;
        color: rgba(132, 83, 43, 0.04);
        letter-spacing: 0.15em;
        pointer-events: none;
        z-index: 0;
        white-space: nowrap;
        font-family: Georgia, serif;
      ">SHVERAA 925</div>

      <!-- Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #18181B; padding-bottom: 20px; position: relative; z-index: 1;">
        <div>
          <div style="font-family: Georgia, serif; font-size: 26px; font-weight: 700; letter-spacing: 0.12em; color: #18181B; margin-bottom: 4px;">
            SHVERAA
          </div>
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #84532B; margin-bottom: 8px;">
            Pure 925 Sterling Silver Atelier
          </div>
          <div style="font-size: 11px; color: #52525B; line-height: 1.5;">
            Shveraa Luxury Silver Private Limited<br />
            Johari Bazar, Heritage Jewellery District, Jaipur, RJ - 302003<br />
            GSTIN: <strong>24AAACS9821F1ZX</strong> • HSN Code: <strong>7113</strong> (Silver Jewellery)<br />
            Email: concierge@shveraa.luxury • Web: www.shveraa.com
          </div>
        </div>

        <div style="text-align: right;">
          <div style="
            display: inline-block;
            background: #18181B;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 4px;
            margin-bottom: 10px;
          ">
            TAX INVOICE
          </div>
          <div style="font-size: 11px; color: #71717A;">Original for Recipient</div>
          <div style="font-size: 14px; font-weight: 700; color: #18181B; margin-top: 4px;">
            ${invoiceNo}
          </div>
          <div style="font-size: 11px; color: #52525B; margin-top: 2px;">
            Invoice Date: <strong>${orderDate}</strong>
          </div>
        </div>
      </div>

      <!-- Order & Customer Meta Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 20px 0; padding: 14px 16px; background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 8px; position: relative; z-index: 1;">
        <!-- Billed & Shipped To -->
        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #84532B; margin-bottom: 6px;">
            Billed &amp; Shipped To (Patron)
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #18181B; margin-bottom: 4px;">
            ${customerName}
          </div>
          <div style="font-size: 11px; color: #52525B; line-height: 1.5; margin-bottom: 4px;">
            ${fullAddress}
          </div>
          <div style="font-size: 11px; color: #52525B;">
            Contact: <strong>${customerPhone}</strong> ${customerEmail ? `• ${customerEmail}` : ''}
          </div>
        </div>

        <!-- Consignment & Payment Details -->
        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #84532B; margin-bottom: 6px;">
            Consignment &amp; Settlement Details
          </div>
          <div style="font-size: 11px; color: #27272A; line-height: 1.6;">
            <div>Order Reference: <strong style="font-family: monospace; font-size: 12px; color: #18181B;">${orderRef}</strong></div>
            <div>Courier Partner: <strong>Delhivery Air Express (Insured)</strong></div>
            <div>Waybill / AWB No: <strong style="font-family: monospace; color: #84532B;">${waybill}</strong></div>
            <div>Payment Method: <strong>${paymentMethod}</strong></div>
            
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; position: relative; z-index: 1;">
        <thead>
          <tr style="background: #18181B; color: #FFFFFF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;">
            <th style="padding: 10px 8px; text-align: center; width: 35px;">#</th>
            <th style="padding: 10px 12px; text-align: left;">Artisan Jewellery Description</th>
            <th style="padding: 10px 10px; text-align: center; width: 90px;">Purity</th>
            <th style="padding: 10px 8px; text-align: center; width: 60px;">Size</th>
            <th style="padding: 10px 8px; text-align: center; width: 45px;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; width: 85px;">Rate (₹)</th>
            <th style="padding: 10px 12px; text-align: right; width: 95px;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => {
            const unitPrice = Number(it.price || 0);
            const qty = Number(it.quantity || 1);
            const lineTotal = unitPrice * qty;
            return `
              <tr style="border-bottom: 1px solid #E4E4E7; font-size: 11px;">
                <td style="padding: 11px 8px; text-align: center; color: #71717A;">${idx + 1}</td>
                <td style="padding: 11px 12px;">
                  <div style="font-weight: 700; color: #18181B; font-size: 12px;">${it.name || 'Pure 925 Silver Piece'}</div>
                  <div style="font-size: 10px; color: #71717A; margin-top: 2px;">
                    ${it.color ? `Finish: ${it.color} • ` : ''}Handcrafted in Jaipur Atelier • Anti-Tarnish Coating
                  </div>
                </td>
                <td style="padding: 11px 10px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 700; color: #84532B; background: #FDF8F3; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(132, 83, 43, 0.2);">
                    925 BIS
                  </span>
                </td>
                <td style="padding: 11px 8px; text-align: center; color: #52525B;">${it.size || 'Free'}</td>
                <td style="padding: 11px 8px; text-align: center; font-weight: 600;">${qty}</td>
                <td style="padding: 11px 12px; text-align: right; color: #52525B;">₹${unitPrice.toLocaleString('en-IN')}</td>
                <td style="padding: 11px 12px; text-align: right; font-weight: 700; color: #18181B;">₹${lineTotal.toLocaleString('en-IN')}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Calculations and Grand Total Grid -->
      <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; margin-top: 16px; position: relative; z-index: 1;">
        <!-- Left: Purity Certification & Words -->
        <div style="font-size: 11px; color: #52525B; line-height: 1.5; padding-right: 12px;">
          <div style="margin-bottom: 8px;">
            <strong>Amount in Words:</strong><br />
            <span style="font-style: italic; color: #18181B; font-weight: 600;">${numberToWords(grandTotal)}</span>
          </div>

          <div style="background: #FDFBF8; border: 1px solid #EFEAE2; border-radius: 6px; padding: 10px; margin-top: 12px;">
            <div style="font-weight: 700; color: #84532B; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">
              BIS Hallmark Purity Covenant
            </div>
            <div style="font-size: 10px; color: #71717A;">
              Guaranteed 92.5% pure solid sterling silver certified under Bureau of Indian Standards (BIS) regulations. Includes complimentary lifetime inspection and cleaning services.
            </div>
          </div>
        </div>

        <!-- Right: Totals Box -->
        <div style="border: 1px solid #E4E4E7; border-radius: 8px; overflow: hidden; background: #FAFAFA;">
          <div style="padding: 10px 14px; display: flex; justify-content: space-between; border-bottom: 1px solid #E4E4E7; font-size: 11px;">
            <span style="color: #71717A;">Item Subtotal</span>
            <strong style="color: #18181B;">₹${subtotal.toLocaleString('en-IN')}</strong>
          </div>

          ${discount > 0 ? `
            <div style="padding: 8px 14px; display: flex; justify-content: space-between; border-bottom: 1px solid #E4E4E7; font-size: 11px; color: #15803D;">
              <span>Voucher / Atelier Privilege Discount</span>
              <strong>- ₹${discount.toLocaleString('en-IN')}</strong>
            </div>
          ` : ''}

          <div style="padding: 8px 14px; display: flex; justify-content: space-between; border-bottom: 1px solid #E4E4E7; font-size: 11px;">
            <span style="color: #71717A;">Insured Doorstep Shipping</span>
            <span style="color: ${shippingCharges === 0 ? '#15803D' : '#18181B'}; font-weight: 600;">
              ${shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toLocaleString('en-IN')}`}
            </span>
          </div>

         

          <div style="padding: 12px 14px; display: flex; justify-content: space-between; background: #18181B; color: #FFFFFF; font-size: 13px;">
            <strong style="text-transform: uppercase; letter-spacing: 0.05em;">Total Amount Paid</strong>
            <strong style="font-size: 16px;">₹${grandTotal.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      <!-- Footer & Authorisation -->
      <div style="margin-top: 32px; border-top: 1px dashed #D4D4D8; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 1;">
        <div style="font-size: 10px; color: #71717A; line-height: 1.5; max-width: 440px;">
          <strong>Terms &amp; Conditions:</strong><br />
          1. Goods once sold are backed by our 7-day hallmark exchange covenant.<br />
          2. Lifetime free cleaning &amp; polish valid at all Shveraa authorised studios.<br />
          3. This is a system generated legal tax invoice; physical signature is not required.
        </div>

        <div style="text-align: center;">
          <div style="
            font-family: 'Brush Script MT', cursive, Georgia, serif;
            font-size: 20px;
            color: #84532B;
            margin-bottom: 4px;
          ">
            Shveraa Atelier
          </div>
          <div style="border-top: 1px solid #18181B; width: 140px; padding-top: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #27272A;">
            Authorised Signatory
          </div>
        </div>
      </div>
    </div>
  `;
};

// Direct Download PDF using jsPDF + html2canvas
export const downloadOrderInvoicePDF = async (order, user = {}) => {
  const orderRef = order?.orderNumber || order?._id || 'SHV-ORD';
  const cleanRef = String(orderRef).replace(/[^a-zA-Z0-9_-]/g, '');

  // 1. Create temporary offscreen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px';
  container.style.background = '#FFFFFF';
  container.style.zIndex = '-9999';
  container.innerHTML = generateInvoiceHTML(order, user);
  document.body.appendChild(container);

  try {
    const targetElement = container.querySelector('#shv-invoice-document') || container;

    // 2. Render to high-resolution canvas
    const canvas = await html2canvas(targetElement, {
      scale: 2, // 2x scale for sharp text
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 3. Create PDF (A4: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfPageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }
    }

    // 4. Trigger download
    pdf.save(`Shveraa_Tax_Invoice_${cleanRef}.pdf`);
    return { success: true };
  } catch (err) {
    console.error('Invoice PDF generation failed:', err);
    // Fallback to print window if canvas fails
    printOrderInvoice(order, user);
    return { success: false, error: err?.message };
  } finally {
    // 5. Clean up temporary DOM element
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

// Isolated Print Method (opens clean print dialog directly on the invoice)
export const printOrderInvoice = (order, user = {}) => {
  const invoiceHtml = generateInvoiceHTML(order, user);
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.top = '-9999px';
  printIframe.style.left = '-9999px';
  printIframe.style.width = '794px';
  printIframe.style.height = '1123px';
  printIframe.style.border = 'none';

  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - ${order?.orderNumber || 'SHVERAA'}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
            background: #FFFFFF;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        ${invoiceHtml}
      </body>
    </html>
  `);
  doc.close();

  printIframe.contentWindow.focus();
  setTimeout(() => {
    printIframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
    }, 1500);
  }, 300);
};
