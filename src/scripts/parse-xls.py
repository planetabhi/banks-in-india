import zipfile
import xml.etree.ElementTree as ET
import json
import os
import re

def strip_ns(tag):
    return tag.split('}')[-1]

def parse_xlsx(filepath):
    try:
        with zipfile.ZipFile(filepath, 'r') as z:
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                root = ET.fromstring(z.read('xl/sharedStrings.xml'))
                for child in root:
                    text = "".join(node.text for node in child.iter() if strip_ns(node.tag) == 't' and node.text)
                    shared_strings.append(text)
            
            sheet_files = [n for n in z.namelist() if n.startswith('xl/worksheets/sheet')]
            if not sheet_files:
                return []
                
            sheet = ET.fromstring(z.read(sheet_files[0]))
            
            rows = []
            for row in sheet.findall('.//{*}row'):
                row_data = []
                last_col_idx = 0
                for c in row.findall('.//{*}c'):
                    # To handle empty columns, we check 'r' attribute like A1, B1
                    r = c.attrib.get('r', '')
                    col_letters = "".join([char for char in r if char.isalpha()])
                    if col_letters:
                        col_idx = 0
                        for char in col_letters:
                            col_idx = col_idx * 26 + (ord(char.upper()) - ord('A') + 1)
                        # pad blanks
                        while last_col_idx + 1 < col_idx:
                            row_data.append("")
                            last_col_idx += 1
                        last_col_idx = col_idx
                        
                    v_node = c.find('.//{*}v')
                    if v_node is not None and v_node.text is not None:
                        if c.attrib.get('t') == 's':
                            try:
                                val = shared_strings[int(v_node.text)]
                            except:
                                val = v_node.text
                        else:
                            val = v_node.text
                        row_data.append(val.strip())
                    else:
                        
                        # sometimes string is inline
                        is_node = c.find('.//{*}is')
                        if is_node is not None:
                            t_node = is_node.find('.//{*}t')
                            if t_node is not None and t_node.text:
                                row_data.append(t_node.text.strip())
                                continue
                        row_data.append("")
                        
                if any(row_data):
                    rows.append(row_data)
            
            return rows
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        return []

def list_to_dicts(rows):
    if not rows: return []
    # Identify header row (usually first row with actual alpha content)
    header = rows[0]
    out = []
    for r in rows[1:]:
        obj = {}
        for i, val in enumerate(r):
            if i < len(header) and header[i]:
                obj[header[i]] = val
        out.append(obj)
    return out

targets = [
    {
        "in": "src/datasets/xls/All_Members_UPI_upi.xlsx.xlsx",
        "out": "src/datasets/npci/upi.json"
    },
    {
        "in": "src/datasets/xls/All_Members_NETC_netc-fas-tag.xlsx.xlsx",
        "out": "src/datasets/npci/fastag.json"
    },
    {
        "in": "src/datasets/xls/All_Members_Aeps_mainline-commercial-banks.xlsx.xlsx",
        "out": "src/datasets/npci/aeps.json"
    },
    {
        "in": "src/datasets/xls/68774.xlsx",
        "out": "src/datasets/rbi/bsr-codes.json"
    }
]

# Ensure dirs exist
os.makedirs("src/datasets/npci", exist_ok=True)
os.makedirs("src/datasets/rbi", exist_ok=True)

for tgt in targets:
    if os.path.exists(tgt["in"]):
        print(f"Processing {tgt['in']}...")
        rows = parse_xlsx(tgt["in"])
        data = list_to_dicts(rows)
        with open(tgt["out"], "w") as f:
            json.dump(data, f, indent=2)
        print(f"Saved {len(data)} items to {tgt['out']}")
    else:
        print(f"File missing: {tgt['in']}")
