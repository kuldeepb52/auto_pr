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
    // Strip out commas in case numbers come formatted as text (e.g. 1,250.00)
    const cleanStr = String(value).replace(/,/g, '').trim();
    return parseFloat(cleanStr) || 0;
}

const AnnexureB_Rules = {
    getSerialNumber: (serialNumber, zmmRecords, me2mRecords) => serialNumber,
    getMaterialCode: (materialCode, zmmRecords, me2mRecords) => materialCode,
    getOldMaterialCode: (zmmRecords, me2mRecords) => '',
    
    // Column 4: Item Description
    getItemDescription: (zmmRecords, me2mRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return '';
        return String(getValueByFlexibleKey(zmmRecords[0], 'description')).trim();
    },

    getPopulation: (zmmRecords, me2mRecords) => '',
    getQtyProposed: (zmmRecords, me2mRecords) => '',

    // Column 7: Quantity in Stock
    getQtyInStock: (zmmRecords, me2mRecords) => {
        if (!zmmRecords || zmmRecords.length === 0) return 0;
        return parseSapNumeric(getValueByFlexibleKey(zmmRecords[0], 'stock'));
    },

    getSafetyStock: (zmmRecords, me2mRecords) => '',
    getMandatorySpareQty: (zmmRecords, me2mRecords) => '',
    getNormalLife: (zmmRecords, me2mRecords) => '',

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

    getFailureRate: (zmmRecords, me2mRecords) => '',
    getPipelinePoNoDate: (me2mRecords) => '',
    getPipelinePoQty: (me2mRecords) => '',
    getPipelinePrNoDate: (zmmRecords) => '',
    getPipelinePrQty: (zmmRecords) => '',
    getLastPoNoDate: (me2mRecords) => '',
    getLastPoItemSlNo: (me2mRecords) => '',
    getJustification: (zmmRecords, me2mRecords) => ''
};
