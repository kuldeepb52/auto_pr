/**
 * INDUSTRIAL ROBUST KEY EXTRACTOR
 * Normalizes keys to ignore variations in SAP space padding or column dots.
 */
function getValueByFlexibleKey(row, substringMatch) {
    if (!row) return '';
    const target = substringMatch.toLowerCase().replace(/\s+/g, '');
    for (let key in row) {
        if (key.toLowerCase().replace(/\s+/g, '').includes(target)) {
            return row[key];
        }
    }
    return '';
}

function parseSapNumeric(value) {
    if (value === undefined || value === null) return 0;
    const cleanStr = String(value).replace(/,/g, '').trim();
    return parseFloat(cleanStr) || 0;
}

/**
 * BULLETPROOF SAP / EXCEL DATE FIXER
 * Catches Excel serials (number or string), SAP YYYYMMDD strings, and standard dates.
 */
function formatSapDate(val) {
    if (val === undefined || val === null || val === '') return '';
    
    let strVal = String(val).trim();
    
    // 1. Catch Excel Serial Numbers (e.g. 45366 or 45366.5)
    if (/^\d{5}(\.\d+)?$/.test(strVal)) {
        const numVal = parseFloat(strVal);
        if (numVal > 40000 && numVal < 60000) { 
            const dateObj = new Date(Math.round((numVal - 25569) * 86400 * 1000));
            const d = String(dateObj.getUTCDate()).padStart(2, '0');
            const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const y = dateObj.getUTCFullYear();
            return `${d}.${m}.${y}`;
        }
    }

    // 2. Catch SAP Raw Internal Format (YYYYMMDD) e.g., "20240315"
    if (/^\d{8}$/.test(strVal)) {
        const y = strVal.substring(0, 4);
        const m = strVal.substring(4, 6);
        const d = strVal.substring(6, 8);
        return `${d}.${m}.${y}`;
    }

    // 3. Catch DD.MM.YYYY, DD/MM/YYYY, or DD-MM-YYYY and normalize to dots
    if (/^\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4}$/.test(strVal)) {
        return strVal.replace(/[\/\-]/g, '.'); 
    }

    // 4. Catch standard web date formats (YYYY-MM-DD or MM/DD/YYYY)
    const parsedDate = new Date(strVal);
    if (!isNaN(parsedDate.getTime())) {
        const d = String(parsedDate.getDate()).padStart(2, '0');
        const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const y = parsedDate.getFullYear();
        return `${d}.${m}.${y}`;
    }

    // 5. Failsafe: If it is completely unrecognized text, just return it as is
    return strVal;
}

const AnnexureB_Rules = {
    getSerialNumber: (serialNumber) => serialNumber,
    getMaterialCode: (materialCode) => materialCode,
    getOldMaterialCode: () => '',
    
    // Column 4: Item Description
    getItemDescription: (zmmRecords, me2mRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return '[DESCRIPTION NOT FOUND IN SAP]';
        return String(getValueByFlexibleKey(zmmRecords[0], 'description')).trim();
    },

    getPopulation: () => '',
    getQtyProposed: () => '',

    // Column 7: Quantity in Stock
    getQtyInStock: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'stock'));
    },

    getSafetyStock: () => '',
    getMandatorySpareQty: () => '',
    getNormalLife: () => '',

    // Column 11: Five Year Consumption Grid Logic (Columns K to O)
    getConsumptionYr4: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'yr-4'));
    },
    getConsumptionYr3: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'yr-3'));
    },
    getConsumptionYr2: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'yr-2'));
    },
    getConsumptionPrevYr: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'prevfn'));
    },
    getConsumptionCurrYr: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'currfin.year')) || 
               parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'currfinyear'));
    },

    getFailureRate: () => '',

    // Column 12 (Excel Column Q): Pipeline PO No & Date from ZMMMATHIST
    getPipelinePoNoDate: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 'NA';
        
        const poRows = zmmRecords.filter(r => {
            const docType = String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase();
            return docType === 'poitem';
        });
        
        if (poRows.length === 0) return 'NA';

        const formattedPOs = poRows.map(row => {
            const docDetail = String(getValueByFlexibleKey(row, 'doc.detail')).trim();
            const poNumber = docDetail.split('/')[0].trim();
            
            // Extract and format Date
            const rawReqDate = getValueByFlexibleKey(row, 'req.date');
            const reqDate = formatSapDate(rawReqDate);
            
            return (poNumber && reqDate) ? `${poNumber} / ${reqDate}` : poNumber;
        }).filter(Boolean);

        return formattedPOs.length > 0 ? formattedPOs.join('\n') : 'NA';
    },

    // Column 13 (Excel Column R): Pipeline PO Quantity from ZMMMATHIST
    getPipelinePoQty: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;

        const poRows = zmmRecords.filter(r => {
            const docType = String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase();
            return docType === 'poitem';
        });

        return poRows.reduce((sum, row) => {
            return sum + parseSapNumeric(getValueByFlexibleKey(row, 'quantity'));
        }, 0);
    },

    // Column 14 (Excel Column S): Pipeline PR No & Date from ZMMMATHIST
    getPipelinePrNoDate: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 'NA';
        
        const prRows = zmmRecords.filter(r => {
            const docType = String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase();
            return docType === 'purrqs';
        });
        
        if (prRows.length === 0) return 'NA';

        const formattedPRs = prRows.map(row => {
            const docDetail = String(getValueByFlexibleKey(row, 'doc.detail')).trim();
            const prNumber = docDetail.split('/')[0].trim();
            
            // Extract and format Date
            const rawReqDate = getValueByFlexibleKey(row, 'req.date');
            const reqDate = formatSapDate(rawReqDate);
            
            return (prNumber && reqDate) ? `${prNumber} / ${reqDate}` : prNumber;
        }).filter(Boolean);

        return formattedPRs.length > 0 ? formattedPRs.join('\n') : 'NA';
    },

    // Column 15 (Excel Column T): Pipeline PR Quantity from ZMMMATHIST
    getPipelinePrQty: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;

        const prRows = zmmRecords.filter(r => {
            const docType = String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase();
            return docType === 'purrqs';
        });

        return prRows.reduce((sum, row) => {
            return sum + parseSapNumeric(getValueByFlexibleKey(row, 'quantity'));
        }, 0);
    },

    getLastPoNoDate: () => '',
    getLastPoItemSlNo: () => '',
    
    // Column 17 (Excel Column W): Justification Fallback Protocol
    getJustification: (zmmRecords, me2mRecords) => {
        if ((!zmmRecords || zmmRecords.length === 0) && (!me2mRecords || me2mRecords.length === 0)) {
            return 'No stock/consumption history found in SAP. First-time procurement or manual entry required.';
        }
        return '';
    }
};
