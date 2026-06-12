import * as XLSX from "xlsx";

interface TaxRow {
  Reporting_Month: string;
  Vendor_TIN: string;
  branchCode: string;
  companyName?: string;
  surName?: string;
  firstName?: string;
  middleName?: string;
  ATC: string;
  income_payment: string;
  ewt_rate?: string;
  tax_amount?: string;
}

export function compileEQSched1(csvText: string, userTin: string): string {
  // 1. Parse the raw CSV text back into an array of JSON objects
  const workbook = XLSX.read(csvText, { type: "string" });
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json<TaxRow>(workbook.Sheets[sheetName]);

  let datContent = "";
  let sequenceCounter = 1;
  
  // Accumulators for the final Control (C) line
  let totalGrossAmount = 0;
  let totalTaxAmount = 0;

  // 2. Generate the Header (H) Line
  // Format: H,sequence,formType,userTin+branch,MM,DD,YYYY
  const cleanUserTin = userTin.replace(/[^0-9]/g, "").padStart(13, "0");
  datContent += `H,${sequenceCounter},1601EQ,${cleanUserTin},06,30,2026\r\n`;

  // 3. Loop through rows and build Detail (D) Lines
  for (const row of rows) {
    // Skip empty rows or header duplicate rows if they don't have a TIN
    if (!row.Vendor_TIN) continue;

    sequenceCounter++;

    // Sanitize and pad TIN (9 digits) and Branch Code (4 digits)
    const cleanTin = String(row.Vendor_TIN).replace(/[^0-9]/g, "").padStart(9, "0");
    const cleanBranch = String(row.branchCode || "0").replace(/[^0-9]/g, "").padStart(4, "0");

    // Extract names safely
    const compName = row.companyName || "";
    const lName = row.surName || "";
    const fName = row.firstName || "";
    const mName = row.middleName || "";

    const atc = String(row.ATC).trim();
    
    // Parse numeric values safely
    const gross = parseFloat(row.income_payment || "0");
    const rate = parseFloat(row.ewt_rate || "0");
    const tax = parseFloat(row.tax_amount || "0");

    // Add to control accumulators
    totalGrossAmount += gross;
    totalTaxAmount += tax;

    // Build the positional D line based on BIR specs
    // Schedule 1 indicator is '1' right after the sequence counter
    datContent += `D,${sequenceCounter},1,${cleanTin},${cleanBranch},${compName},${lName},${fName},${mName},,${atc},${gross.toFixed(2)},${rate.toFixed(2)},${tax.toFixed(2)}\r\n`;
  }

  // 4. Generate the Control (C) Line
  sequenceCounter++;
  const totalRecords = sequenceCounter - 2; // Total D lines compiled
  datContent += `C,${sequenceCounter},${totalRecords},${totalGrossAmount.toFixed(2)},${totalTaxAmount.toFixed(2)}\r\n`;

  return datContent;
}