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

    // Column 11: Five Year Consumption Grid Logic
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
        if (!zmmRecords || zmmRecords.length === 0) return '';
        
        // Filter rows where Doc. Type is 'Poitem'
        const poRows = zmmRecords.filter(r => {
            const docType = String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase();
            return docType === 'poitem';
        });
        
        if (poRows.length === 0) return '';

        // Extract and format all unique pipeline PO instances found
        return poRows.map(row => {
            const docDetail = String(getValueByFlexibleKey(row, 'doc.detail')).trim();
            // Split by '/' to extract the PO number before the slash
            const poNumber = docDetail.split('/')[0].trim();
            const reqDate = String(getValueByFlexibleKey(row, 'req.date')).trim();
            
            return (poNumber && reqDate) ? `${poNumber} / ${reqDate}` : poNumber;
        }).filter(Boolean).join('\n');
    },

    // Column 13 (Excel Column R): Pipeline PO Quantity from ZMMMATHIST
    getPipelinePoQty: (zmmRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;

        const poRows = zmmRecords.filter(r => {
            const docType = String(getValueByFlexibleKey(r, 'doc.type')).trim().toLowerCase();
            return docType === 'poitem';
        });

        // Sum up quantities if multiple pipeline PO components exist for this material
        return poRows.reduce((sum, row) => {
            return sum + parseSapNumeric(getValueByFlexibleKey(row, 'quantity'));
        }, 0);
    },

    getPipelinePrNoDate: () => '',
    getPipelinePrQty: () => '',
    getLastPoNoDate: () => '',
    getLastPoItemSlNo: () => '',
    
    // Column 17: Justification
    getJustification: (zmmRecords, me2mRecords) => {
        if ((!zmmRecords || zmmRecords.length === 0) && (!me2mRecords || me2mRecords.length === 0)) {
            return 'No stock/consumption history found in SAP. First-time procurement or manual entry required.';
        }
        return '';
    }
};
