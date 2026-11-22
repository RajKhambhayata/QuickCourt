const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function buildPartnerHandbookPDF() {
  console.log('🚀 Starting QuickCourt Project Partner Handbook PDF generation...');

  const templatePath = path.resolve(__dirname, 'partner-handbook-template.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('Template not found at: ' + templatePath);
  }

  const outputDir = path.resolve(__dirname, '..', 'output', 'pdf');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'QuickCourt_Project_Partner_Handbook.pdf');
  const publicPdfPath = path.resolve(__dirname, '..', 'public', 'QuickCourt_Project_Partner_Handbook.pdf');
  const artifactPdfPath = 'C:\\Users\\rajkh\\.gemini\\antigravity\\brain\\fbf08946-a758-448c-a9ae-8db59b4f6983\\QuickCourt_Project_Partner_Handbook.pdf';

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    const fileUrl = 'file:///' + templatePath.replace(/\\/g, '/');
    console.log('Loading template from:', fileUrl);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    console.log('Rendering PDF with A4 format and background graphics...');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '12mm',
        right: '12mm',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 8px; font-family: sans-serif; color: #71856A; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; border-bottom: 1px solid #E8EDE4; padding-bottom: 4px;">
          <span>QuickCourt Systems — Project Partner Engineering Handbook</span>
          <span>Internal Reference</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 8px; font-family: sans-serif; color: #71856A; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; border-top: 1px solid #E8EDE4; padding-top: 4px;">
          <span>Confidential — For Faculty Examination & Partner Review</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    console.log('✅ Generated handbook PDF at:', pdfPath);

    // Copy to public folder
    fs.copyFileSync(pdfPath, publicPdfPath);
    console.log('✅ Copied handbook PDF to public directory at:', publicPdfPath);

    // Copy to artifact directory if it exists
    const artifactDir = path.dirname(artifactPdfPath);
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(pdfPath, artifactPdfPath);
      console.log('✅ Copied handbook PDF to brain artifacts at:', artifactPdfPath);
    }

    const stats = fs.statSync(pdfPath);
    console.log(`📄 PDF file size: ${(stats.size / 1024).toFixed(1)} KB`);

  } finally {
    await browser.close();
  }
}

buildPartnerHandbookPDF().catch((err) => {
  console.error('❌ Failed to generate partner handbook PDF:', err);
  process.exit(1);
});
