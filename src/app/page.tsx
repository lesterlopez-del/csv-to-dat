"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!file) return alert("Please upload a file first.");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Dynamically strip out the old extension (.csv, .xlsx, or .xls) and swap it for .dat
      const baseName = file.name.substring(0, file.name.lastIndexOf("."));
      a.download = `${baseName}.dat`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      alert("Error generating .dat file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-400">BIR CSV to .DAT Testing Portal</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Upload a CSV or Excel file to test the isolated compiler logic</p>
        
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
            id="csv-upload"
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
          />
          <label htmlFor="csv-upload" className="cursor-pointer block text-gray-300">
            {file ? (
              <span className="text-green-400 font-medium">Selected: {file.name}</span>
            ) : (
              <span>Click to select or drag a CSV/Excel file</span>
            )}
          </label>
        </div>

        <button 
          onClick={handleConvert} 
          disabled={loading || !file}
          className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 font-semibold rounded-lg transition-colors shadow-md shadow-blue-900/20"
        >
          {loading ? "Processing..." : "Convert to .DAT"}
        </button>
      </div>
    </main>
  );
}