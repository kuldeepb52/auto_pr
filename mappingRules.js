/**
 * ============================================================
 * MAPPING RULES  —  Annexure A & Annexure B
 * ============================================================
 */

// ─────────────────────────────────────────────
// SHARED UTILITY FUNCTIONS
// ─────────────────────────────────────────────

/**
 * INDUSTRIAL ROBUST KEY EXTRACTOR
 * Normalises keys to ignore SAP space-padding and column dots.
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
 * Handles Excel serials, SAP YYYYMMDD, and standard date strings.
 */
function formatSapDate(val) {
    if (val === undefined || val === null || val === '') return '';

    let strVal = String(val).trim();

    // 1. Excel Serial Numbers (e.g. 45366)
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

    // 2. SAP Raw Internal Format YYYYMMDD
    if (/^\d{8}$/.test(strVal)) {
        const y = strVal.substring(0, 4);
        const m = strVal.substring(4, 6);
        const d = strVal.substring(6, 8);
        return `${d}.${m}.${y}`;
    }

    // 3. DD.MM.YYYY / DD/MM/YYYY / DD-MM-YYYY
    if (/^\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4}$/.test(strVal)) {
        return strVal.replace(/[\/\-]/g, '.');
    }

    // 4. Standard web date formats (YYYY-MM-DD or MM/DD/YYYY)
    const parsedDate = new Date(strVal);
    if (!isNaN(parsedDate.getTime())) {
        const d = String(parsedDate.getDate()).padStart(2, '0');
        const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const y = parsedDate.getFullYear();
        return `${d}.${m}.${y}`;
    }

    // 5. Fallback: return as-is
    return strVal;
}


// ─────────────────────────────────────────────
// ANNEXURE A  — ESTIMATION SHEET RULES
// ─────────────────────────────────────────────

/**
 * Column map (A=1 … M=13):
 *  A  S No.
 *  B  Material (code)
 *  C  Material Description
 *  D  Population
 *  E  Stock Qty
 *  F  Qty requested
 *  G  Unit of Measure
 *  H  Last PO No.
 *  I  Last PO date
 *  J  LPP  (Last Purchase Price)
 *  K  Budgetary offer
 *  L  Estimated Rate
 *  M  Total Value  (formula: L * F)
 */
const AnnexureA_Rules = {

    getSerialNumber: (idx) => idx,

    getMaterialCode: (materialCode) => materialCode,

    // Col C — Description from ZMM (first record)
    getDescription: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return '[DESCRIPTION NOT FOUND]';
        return String(getValueByFlexibleKey(zmmRecords[0], 'description')).trim();
    },

    // Col D — Population (blank — indentor fills)
    getPopulation: () => '',

    // Col E — Stock Qty from ZMM
    getStockQty: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'stock'));
    },

    // Col F — Qty requested (blank — indentor fills)
    getQtyRequested: () => '',

    // Col G — Unit of Measure from ZMM
    getUnitOfMeasure: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return '';
        return String(getValueByFlexibleKey(zmmRecords[0], 'unit') ||
                      getValueByFlexibleKey(zmmRecords[0], 'uom')  ||
                      getValueByFlexibleKey(zmmRecords[0], 'baseu')).trim();
    },

    // Col H — Last PO No. (blank — indentor fills / future mapping)
    getLastPoNo: () => '',

    // Col I — Last PO date (blank — indentor fills / future mapping)
    getLastPoDate: () => '',

    // Col J — LPP  (blank — indentor fills / future mapping)
    getLPP: () => '',

    // Col K — Budgetary offer (blank — indentor fills)
    getBudgetaryOffer: () => '',

    // Col L — Estimated Rate (blank — indentor fills)
    getEstimatedRate: () => '',

    // Col M — Total Value: Excel formula  =L{row}*F{row}
    // (row number is injected by the exporter)
    getTotalValueFormula: (excelRowNumber) => `=L${excelRowNumber}*F${excelRowNumber}`,
};


// ─────────────────────────────────────────────
// ANNEXURE B  — MATERIAL PROCUREMENT JUSTIFICATION RULES
// ─────────────────────────────────────────────

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

    // Columns 11-15: Five-Year Consumption Grid
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

    // Column Q: Pipeline PO No & Date
    getPipelinePoNoDate: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 'NA';

        const poRows = zmmRecords.filter(r => {
            const docType = String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase();
            return docType === 'poitem';
        });

        if (poRows.length === 0) return 'NA';

        const formatted = poRows.map(row => {
            const docDetail = String(getValueByFlexibleKey(row, 'doc.detail')).trim();
            const poNumber  = docDetail.split('/')[0].trim();
            const reqDate   = formatSapDate(getValueByFlexibleKey(row, 'req.date'));
            return (poNumber && reqDate) ? `${poNumber} / ${reqDate}` : poNumber;
        }).filter(Boolean);

        return formatted.length > 0 ? formatted.join('\n') : 'NA';
    },

    // Column R: Pipeline PO Quantity
    getPipelinePoQty: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;

        const poRows = zmmRecords.filter(r =>
            String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase() === 'poitem'
        );

        return poRows.reduce((sum, row) =>
            sum + parseSapNumeric(getValueByFlexibleKey(row, 'quantity')), 0);
    },

    // Column S: Pipeline PR No & Date
    getPipelinePrNoDate: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 'NA';

        const prRows = zmmRecords.filter(r =>
            String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase() === 'purrqs'
        );

        if (prRows.length === 0) return 'NA';

        const formatted = prRows.map(row => {
            const docDetail = String(getValueByFlexibleKey(row, 'doc.detail')).trim();
            const prNumber  = docDetail.split('/')[0].trim();
            const reqDate   = formatSapDate(getValueByFlexibleKey(row, 'req.date'));
            return (prNumber && reqDate) ? `${prNumber} / ${reqDate}` : prNumber;
        }).filter(Boolean);

        return formatted.length > 0 ? formatted.join('\n') : 'NA';
    },

    // Column T: Pipeline PR Quantity
    getPipelinePrQty: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;

        const prRows = zmmRecords.filter(r =>
            String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase() === 'purrqs'
        );

        return prRows.reduce((sum, row) =>
            sum + parseSapNumeric(getValueByFlexibleKey(row, 'quantity')), 0);
    },

    getLastPoNoDate:   () => '',
    getLastPoItemSlNo: () => '',

    // Column W: Justification
    getJustification: (zmmRecords, me2mRecords) => 'INDENTOR TO FILL',
};
