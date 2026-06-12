export type BIRFormType = 
  | "1601EQ_SCHED1" 
  | "1601FQ_SCHED2" 
  | "FORM_2307" 
  | "UNKNOWN";

/**
 * Inspects the first line of a CSV string to detect the BIR template type
 */
export function detectBIRFormType(csvText: string): BIRFormType {
  if (!csvText) return "UNKNOWN";

  // Grab the first line (the headers) and force lowercase for case-insensitive matching
  const lines = csvText.split(/\r?\n/);
  const firstLine = lines[0];
  if (!firstLine) return "UNKNOWN";

  const headers = firstLine.toLowerCase();

  // 1. Detect Form 2307 (Look for the unique "nature" column)
  if (headers.includes("vendor_tin") && headers.includes("nature") && headers.includes("income_payment")) {
    return "FORM_2307";
  }

  // 2. Detect 1601-FQ Schedule 2 (Fringe Benefits - Look for unique fringe benefit columns)
  if (headers.includes("fringebenefit") || headers.includes("grossupvalue")) {
    return "1601FQ_SCHED2";
  }

  // 3. Detect 1601-EQ Schedule 1 (Standard EWT - Has vendor_tin and ewt_rate, but no fringe benefits)
  if (headers.includes("vendor_tin") && headers.includes("ewt_rate") && headers.includes("income_payment")) {
    return "1601EQ_SCHED1";
  }

  return "UNKNOWN";
}