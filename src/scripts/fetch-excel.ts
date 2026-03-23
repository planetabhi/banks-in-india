// @ts-nocheck
import * as xlsx from 'xlsx';

async function diagnoseExcel(url: string) {
    console.log(`\n--- Diagnosing ${url} ---`);
    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            console.error(`Failed to fetch: ${resp.status} ${resp.statusText}`);
            return;
        }
        const buffer = await resp.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" }) as any[];
        
        console.log(`Total Rows: ${data.length}`);
        console.log(`First row headers:`, Object.keys(data[0] || {}));
        console.log(`Sample row 1:`, data[0]);
        console.log(`Sample row 2:`, data[1]);
    } catch (e) {
        console.error("Error diagnosing:", e);
    }
}

async function run() {
    await diagnoseExcel('https://rbidocs.rbi.org.in/rdocs/content/docs/68774.xlsx'); // NEFT
    await diagnoseExcel('https://rbidocs.rbi.org.in/rdocs/RTGS/DOCs/RTGEB0815.xlsx'); // RTGS
    await diagnoseExcel('https://www.npci.org.in/PDF/npci/ifsc-and-micr-codes/Merged-banks-IFSC-and-MICR.xlsx'); // Merged Banks
}

run();
