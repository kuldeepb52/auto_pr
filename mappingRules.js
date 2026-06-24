/**
 * ISOLATED MAPPING RULES FOR ANNEXURE B COLUMNS
 * Add logic rules inside these independent functions step-by-step.
 */
const AnnexureB_Rules = {
    // Column 1: Sl . No.
    getSerialNumber: (serialNumber, zmmRecords, me2mRecords) => {
        return serialNumber;
    },

    // Column 2: Material Code
    getMaterialCode: (materialCode, zmmRecords, me2mRecords) => {
        return materialCode;
    },

    // Column 3: Old Material code if any
    getOldMaterialCode: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 4: Item Description
    getItemDescription: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 5: Population of Item
    getPopulation: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 6: Quantity Proposed Indent
    getQtyProposed: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 7: Quantity in Stock as on date
    getQtyInStock: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 8: Safety Stock
    getSafetyStock: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 9: Quantity under Mandatory Spare List
    getMandatorySpareQty: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 10: Normal Life of item (Year)
    getNormalLife: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 11: Consumption Grid (Yr-4 to Current)
    getConsumptionYr4: (zmmRecords) => '',
    getConsumptionYr3: (zmmRecords) => '',
    getConsumptionYr2: (zmmRecords) => '',
    getConsumptionPrevYr: (zmmRecords) => '',
    getConsumptionCurrYr: (zmmRecords) => '',

    // Column 12: Failure rate
    getFailureRate: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    },

    // Column 13: Pipeline PO details
    getPipelinePoNoDate: (me2mRecords) => '',
    getPipelinePoQty: (me2mRecords) => '',

    // Column 14: Pipeline PR details
    getPipelinePrNoDate: (zmmRecords) => '',
    getPipelinePrQty: (zmmRecords) => '',

    // Column 15: Last PO No. & Date
    getLastPoNoDate: (me2mRecords) => '',

    // Column 16: Last Po. Item Sl. No.
    getLastPoItemSlNo: (me2mRecords) => '',

    // Column 17: Justification of Qty
    getJustification: (zmmRecords, me2mRecords) => {
        return ''; // [Placeholder for next steps]
    }
};
