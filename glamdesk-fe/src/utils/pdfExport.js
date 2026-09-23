/**
 * pdfExport.js - Utility for downloading and printing luxury A4 Quotation PDFs in GlamDesk.
 *
 * Supports:
 * 1. Direct PDF Download via dynamic html2pdf.js bundle.
 * 2. High-resolution vector Print-to-PDF via dedicated printable window.
 * 3. Personalized WhatsApp companion text generator.
 */

// Cache the loaded html2pdf library instance
let html2pdfPromise = null;

export const loadHtml2Pdf = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.html2pdf) return Promise.resolve(window.html2pdf);
  if (html2pdfPromise) return html2pdfPromise;

  html2pdfPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve(window.html2pdf || null);
    };
    script.onerror = () => {
      console.warn("Could not load html2pdf from CDN, fallback to native print.");
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return html2pdfPromise;
};

/**
 * Downloads an HTML element as a PDF file.
 * Falls back to native print if html2pdf cannot be loaded.
 */
export const downloadPdfFromElement = async (
  elementOrId,
  filename = "Quotation.pdf"
) => {
  const element =
    typeof elementOrId === "string"
      ? document.getElementById(elementOrId)
      : elementOrId;

  if (!element) {
    console.error("PDF element not found:", elementOrId);
    return false;
  }

  try {
    const html2pdf = await loadHtml2Pdf();
    if (html2pdf) {
      const opt = {
        margin: [6, 6, 6, 6],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await html2pdf().set(opt).from(element).save();
      return true;
    }
  } catch (err) {
    console.warn("Direct html2pdf generation failed, falling back to print:", err);
  }

  // Fallback: Trigger print preview
  printElement(element, filename);
  return true;
};

/**
 * Opens a dedicated print dialog for the given element with A4 page styling.
 */
export const printElement = (elementOrId, documentTitle = "Quotation") => {
  const element =
    typeof elementOrId === "string"
      ? document.getElementById(elementOrId)
      : elementOrId;

  if (!element) return;

  const printWindow = window.open("", "_blank", "width=850,height=1000");
  if (!printWindow) {
    // If popup blocked, print current window with print classes
    window.print();
    return;
  }

  // Copy stylesheets and fonts
  const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((el) => el.outerHTML)
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${documentTitle}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff !important;
            color: #1a1a1a !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .font-outfit {
            font-family: 'Outfit', sans-serif !important;
          }
          @media print {
            body {
              background-color: #ffffff !important;
            }
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 210mm; margin: 0 auto;">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 350);
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Generates companion WhatsApp message when sending quotation PDF
 */
export const getWhatsAppCompanionMessage = ({
  clientName,
  appointmentCode,
  serviceName,
  eventDate,
  venueName,
  totalAmount,
  advanceRequired,
  upiId,
  salonName = "GlamDesk Atelier",
}) => {
  return `Dear *${clientName || "Valued Client"}*,

Thank you for choosing ${salonName}! Here is the quotation for your upcoming booking:

💄 *Appointment:* ${serviceName || "Bridal Service"}
📅 *Date & Time:* ${eventDate || "Upcoming Date"}
📍 *Venue:* ${venueName || "Confirmed Location"}

📄 *Please find your official quotation PDF attached* with complete service scope, package breakdown, and advance payment instructions.

_Kindly review the attached quote and transfer the advance deposit to confirm your slot._

Warm regards,
*Team ${salonName}*`;
};
