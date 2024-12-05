import { useState } from "react";
import * as XLSX from 'xlsx';

const Sheet_Uploader = ({ setJsonData }) => {
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            setJsonData(json);
            console.log(json);
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div style={{ padding: '20px' }}>
            <label className="bg-mainBackgroundColor text-accentColor px-4 py-1 rounded-md hover:opacity-90 transition-opacity cursor-pointer">
                Upload Sheet
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
            </label>
        </div>
    );
};

export default Sheet_Uploader;