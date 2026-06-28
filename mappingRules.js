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
 * BULLETPROOF SAP / EXCEL DATE FIXER (UPDATED TO STANDARD SLASHES)
 */
function formatSapDate(val) {
    if (val === undefined || val === null || val === '') return '';
    
    let strVal = String(val).trim();
    
    // 1. Excel Serial Numbers
    if (/^\d{5}(\.\d+)?$/.test(strVal)) {
        const numVal = parseFloat(strVal);
        if (numVal > 40000 && numVal < 60000) { 
            const dateObj = new Date(Math.round((numVal - 25569) * 86400 * 1000));
            const d = String(dateObj.getUTCDate()).padStart(2, '0');
            const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const y = dateObj.getUTCFullYear();
            return `${d}/${m}/${y}`; // Changed to slashes
        }
    }

    // 2. SAP Raw Internal Format (YYYYMMDD)
    if (/^\d{8}$/.test(strVal)) {
        const y = strVal.substring(0, 4);
        const m = strVal.substring(4, 6);
        const d = strVal.substring(6, 8);
        return `${d}/${m}/${y}`; // Changed to slashes
    }

    // 3. Catch existing formats and normalize to slashes
    if (/^\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4}$/.test(strVal)) {
        return strVal.replace(/[\.\-]/g, '/'); // Force slashes instead of dots/dashes
    }

    // 4. Standard web date parsing
    const parsedDate = new Date(strVal);
    if (!isNaN(parsedDate.getTime())) {
        const d = String(parsedDate.getDate()).padStart(2, '0');
        const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const y = parsedDate.getFullYear();
        return `${d}/${m}/${y}`; // Changed to slashes
    }

    return strVal;
}

/**
 * DATE SORTER ENGINE (UPDATED TO READ SLASHES)
 */
function parseDateForSort(dateStr) {
    if (!dateStr) return 0;
    const formatted = formatSapDate(dateStr);
    // Now checks for DD/MM/YYYY to create a sortable timestamp
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
        const parts = formatted.split('/');
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    const fallback = new Date(formatted).getTime();
    return isNaN(fallback) ? 0 : fallback;
}

// ---------------------------------------------------------
// ANNEXURE B LOGIC VAULT
// ---------------------------------------------------------
const AnnexureB_Rules = {
    getSerialNumber: (serialNumber) => serialNumber,
    getMaterialCode: (materialCode) => materialCode,
    getOldMaterialCode: () => '',
    getItemDescription: (zmmRecords, me2mRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return '[DESCRIPTION NOT FOUND IN SAP]';
        return String(getValueByFlexibleKey(zmmRecords[0], 'description')).trim();
    },
    getPopulation: () => '',
    getQtyProposed: () => '',
    getQtyInStock: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'stock'));
    },
    getSafetyStock: () => '',
    getMandatorySpareQty: () => '',
    getNormalLife: () => '',
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
    getPipelinePoNoDate: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 'NA';
        const poRows = zmmRecords.filter(r => String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase() === 'poitem');
        if (poRows.length === 0) return 'NA';
        const formattedPOs = poRows.map(row => {
            const docDetail = String(getValueByFlexibleKey(row, 'doc.detail')).trim();
            const poNumber = docDetail.split('/')[0].trim();
            const reqDate = formatSapDate(getValueByFlexibleKey(row, 'req.date'));
            return (poNumber && reqDate) ? `${poNumber} / ${reqDate}` : poNumber;
        }).filter(Boolean);
        return formattedPOs.length > 0 ? formattedPOs.join('\n') : 'NA';
    },
    getPipelinePoQty: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        const poRows = zmmRecords.filter(r => String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase() === 'poitem');
        return poRows.reduce((sum, row) => sum + parseSapNumeric(getValueByFlexibleKey(row, 'quantity')), 0);
    },
    getPipelinePrNoDate: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 'NA';
        const prRows = zmmRecords.filter(r => String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase() === 'purrqs');
        if (prRows.length === 0) return 'NA';
        const formattedPRs = prRows.map(row => {
            const docDetail = String(getValueByFlexibleKey(row, 'doc.detail')).trim();
            const prNumber = docDetail.split('/')[0].trim();
            const reqDate = formatSapDate(getValueByFlexibleKey(row, 'req.date'));
            return (prNumber && reqDate) ? `${prNumber} / ${reqDate}` : prNumber;
        }).filter(Boolean);
        return formattedPRs.length > 0 ? formattedPRs.join('\n') : 'NA';
    },
    getPipelinePrQty: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        const prRows = zmmRecords.filter(r => String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase() === 'purrqs');
        return prRows.reduce((sum, row) => sum + parseSapNumeric(getValueByFlexibleKey(row, 'quantity')), 0);
    },
    getLastPoNoDate: () => '',
    getLastPoItemSlNo: () => '',
    getJustification: () => 'INDENTOR TO FILL' 
};

// ---------------------------------------------------------
// ANNEXURE A LOGIC VAULT
// ---------------------------------------------------------
const AnnexureA_Rules = {
    // Internal Helper to find absolute latest ME2M row by Date
    _getLatestMe2mRecord: (me2mRecords) => {
        if (!me2mRecords || me2mRecords.length === 0) return null;
        let latestRow = null;
        let maxTimestamp = -1;

        me2mRecords.forEach(row => {
            const rawDate = getValueByFlexibleKey(row, 'documentdate');
            const timestamp = parseDateForSort(rawDate);
            if (timestamp > maxTimestamp) {
                maxTimestamp = timestamp;
                latestRow = row;
            }
        });
        return latestRow;
    },

    getSerialNumber: (idx) => idx,
    getMaterialCode: (m) => m,
    
    getItemDescription: (zmmRecords, me2mRecords) => {
        if (me2mRecords && me2mRecords.length > 0) {
            const desc = String(getValueByFlexibleKey(me2mRecords[0], 'shorttext')).trim();
            if (desc) return desc;
        }
        if (zmmRecords && zmmRecords.length > 0) {
            const desc = String(getValueByFlexibleKey(zmmRecords[0], 'description')).trim();
            if (desc) return desc;
        }
        return '[DESCRIPTION NOT FOUND]';
    },
    
    getPopulation: () => '',
    
    getQtyInStock: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'stock'));
    },
    
    getQtyRequested: () => '',
    
    getUnitOfMeasure: (me2mRecords) => {
        if (!me2mRecords || me2mRecords.length === 0) return '';
        return String(getValueByFlexibleKey(me2mRecords[0], 'orderunit')).trim();
    },
    
    // Column H: Latest PO Number from ME2M
    getLastPoNo: (me2mRecords) => {
        const latestRow = AnnexureA_Rules._getLatestMe2mRecord(me2mRecords);
        if (!latestRow) return 'NA';
        return String(getValueByFlexibleKey(latestRow, 'purchasingdocument')).trim() || 'NA';
    },
    
    // Column I: Latest PO Date from ME2M
    getLastPoDate: (me2mRecords) => {
        const latestRow = AnnexureA_Rules._getLatestMe2mRecord(me2mRecords);
        if (!latestRow) return 'NA';
        const rawDate = getValueByFlexibleKey(latestRow, 'documentdate');
        return formatSapDate(rawDate) || 'NA';
    },

    getLPP: () => '',
    getBudgetaryOffer: () => '',
    getEstimatedRate: () => '',
    getTotalValue: () => ''
};
