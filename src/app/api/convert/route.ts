import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { compileEQSched1 } from "@/core-tax-logic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let csvText = "";

    // Convert incoming file (CSV or Excel) into uniform CSV text structure
    if (file.name.endsWith(".csv")) {
      csvText = await file.text();
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      csvText = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

    // Call your isolated compiler engine!
    // (Using a placeholder company profile TIN: 0009998880000)
    const compiledDatString = compileEQSched1(csvText, "0009998880000");

    return new NextResponse(compiledDatString, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.name.split(".")[0]}.dat"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}