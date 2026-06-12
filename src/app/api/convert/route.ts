import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let csvText = "";

    if (file.name.endsWith(".csv")) {
      // Direct CSV processing
      csvText = await file.text();
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // Excel processing via buffer
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      
      // Grab the first sheet name
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet data to raw CSV string format
      csvText = XLSX.utils.sheet_to_csv(worksheet);
    } else {
      return NextResponse.json({ error: "Unsupported file format. Please upload CSV or Excel." }, { status: 400 });
    }

    // --- YOUR PURE COMPILER LOGIC WILL START HERE ---
    // Right now, let's look at the parsed rows in your terminal console to verify it works:
    console.log("--- Extracted Raw Text Data ---");
    console.log(csvText);
    console.log("--------------------------------");

    // Placeholder valid BIR string structure for testing downloads
    const dummyDatString = "H,1,0001234560000,06,30,2026\r\nD,2,111222333000,0,Juan Dela Cruz,500.00\r\n";

    return new NextResponse(dummyDatString, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.name.split('.')[0]}.dat"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}