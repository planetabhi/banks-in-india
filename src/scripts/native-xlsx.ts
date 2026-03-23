import fs from 'fs';
import path from 'path';

function parseSharedStrings(xmlDir: string): string[] {
    const ssPath = path.join(xmlDir, 'xl', 'sharedStrings.xml');
    if (!fs.existsSync(ssPath)) return [];
    
    const xml = fs.readFileSync(ssPath, 'utf8');
    const strings: string[] = [];
    
    // Some shared strings are just <si><t>Text</t></si>
    // Some are rich text <si><r><t>T</t></r><r><t>ext</t></r></si>
    // We can extract all <t> tags within each <si> and join them
    const siRegex = /<si>(.*?)<\/si>/g;
    const tRegex = /<t[^>]*>(.*?)<\/t>/g;
    
    let siMatch;
    while ((siMatch = siRegex.exec(xml)) !== null) {
        const siContent = siMatch[1];
        let tMatch;
        let str = "";
        while ((tMatch = tRegex.exec(siContent)) !== null) {
            str += tMatch[1];
        }
        strings.push(str);
    }
    return strings;
}

function parseSheet(xmlDir: string, strings: string[], outPath: string) {
    const sheetPath = path.join(xmlDir, 'xl', 'worksheets', 'sheet1.xml');
    if (!fs.existsSync(sheetPath)) return;
    
    const xml = fs.readFileSync(sheetPath, 'utf8');
    
    const rowRegex = /<row r="(\d+)"[^>]*>(.*?)<\/row>/g;
    const cRegex = /<c r="([A-Z]+)\d+"([^>]*)>(.*?)<\/c>/g;
    const vRegex = /<v[^>]*>([^<]*)<\/v>/;

    const data: any[] = [];
    let headers: string[] = [];

    let rowMatch;
    while ((rowMatch = rowRegex.exec(xml)) !== null) {
        const rowInd = parseInt(rowMatch[1]);
        const colsXML = rowMatch[2];
        const rowData: Record<string, string> = {};
        
        let cMatch;
        while ((cMatch = cRegex.exec(colsXML)) !== null) {
            const colLetter = cMatch[1];
            const attrs = cMatch[2];
            const inner = cMatch[3];
            
            const tMatch = attrs.match(/t="([a-z]+)"/);
            const type = tMatch ? tMatch[1] : undefined;
            
            const vMatch = inner.match(vRegex);
            const v = vMatch ? vMatch[1] : undefined;
            
            let finalValue = v ?? "";
            
            if (type === 's' && v !== undefined) {
                const sIdx = parseInt(v);
                finalValue = strings[sIdx] ?? "";
            }
            
            // Clean up ampersands from XML escaping
            finalValue = finalValue.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

            if (rowInd === 1) {
                headers.push(finalValue);
            } else {
                let cIdx = 0;
                for (let i = 0; i < colLetter.length; i++) {
                    cIdx = cIdx * 26 + (colLetter.charCodeAt(i) - 64);
                }
                cIdx -= 1; // 0-indexed
                
                if (headers[cIdx]) {
                    rowData[headers[cIdx]] = finalValue;
                }
            }
        }
        
        if (rowInd > 1 && Object.keys(rowData).length > 0) {
            data.push(rowData);
        }
    }
    
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    console.log(`Writing ${data.length} rows to ${outPath}`);
    fs.writeFileSync(outPath, JSON.stringify(data));
}

function processExcel(extractDir: string, jsonOutPath: string) {
    if (!fs.existsSync(extractDir)) {
        console.error(`Not found: ${extractDir}`);
        return;
    }
    console.log(`Processing ${path.basename(extractDir)}...`);
    const strings = parseSharedStrings(extractDir);
    console.log(`Loaded ${strings.length} shared strings.`);
    parseSheet(extractDir, strings, jsonOutPath);
    console.log(`Done processing ${path.basename(extractDir)}.\n`);
}

function main() {
    processExcel('/tmp/neft', path.resolve('./src/datasets/rbi/neft-ifscs.json'));
    processExcel('/tmp/rtgs', path.resolve('./src/datasets/rbi/rtgs-ifscs.json'));
    processExcel('/tmp/imps', path.resolve('./src/datasets/npci/imps.json'));
    processExcel('/tmp/blocked', path.resolve('./src/datasets/npci/blocked-banks.json'));
    processExcel('/tmp/merged', path.resolve('./src/datasets/mergers/merged-banks.json'));
}

main();
