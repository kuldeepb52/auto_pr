// LOCKED-IN STRUCTURE CONFIGURATION (DO NOT ALTER STRUCTURAL ROWS)
const SCHEMA_TEMPLATES = {
    AnnexureB_TopRows: [
        ['Material Procurement Justification sheet'],
        ['Procurement of xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'],
        ['PRNo.xxxxxx / Date:xxxxxx', '', '', 'Value of  indent in (Rs.): xxxxx/-'],
        ['1','2','3','4','5','6','7','8','9','10','11','','','','','12','13','','14','','15','16','17']
    ],
    AnnexureB_Headers_Row1: [
        'Sl . No.', 'Material Code', 'Old Material code if any', 'Item Description', 
        'Population of Item ', 'Quantity Proposed Indent ', '\nQuantity in Stock as on date', 
        'Saftey Stock*\n(Minimum Qty. to be maintained at site ', 'Quantity under Mandatory Spare List as on date', 
        'Normal Life of item (Year)', 'Actual Consumption in last 5 Years ', '', '', '', '', 
        'Failure rate (frequent /normal)', 'Pipeline PO ', '', 'Pipeline PR', '', 
        'Last PO No. & Date', 'Last Po. Item Sl. No.', 'Justification of Qty'
    ],
    AnnexureB_Headers_Row2: [
        '', '', '', '', '', '', '', '', '', '', 
        'Curr. Fin Yr-4', 'Curr. Fin Yr-3', 'Curr. Fin Yr-2', 'Previous Fin Yr', 'Curr. Fin Year', 
        '', 'PO No. /Date ', 'Qty ', 'PRNo. /Date ', 'Qty ', '', '', ''
    ]
};

/**
 * PRIMARY WORKBOOK COMPILER
 */
function generateAnnexureBWorkbook(zmmRawData, me2mRawData) {
    // Step 1: Identify all unique material codes, filter empty codes, sort ASCENDING order
    const sortedUniqueMaterials = [...new Set(zmmRawData.map(row => {
        return row['Material'] ? String(row['Material']).trim() : '';
    }).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    // Step 2: Establish decoupled registries to keep file data entirely uncombined
    const zmmRegistry = new Map();
    zmmRawData.forEach(row => {
        const mat = row['Material'] ? String(row['Material']).trim() : '';
        if (!mat) return;
        if (!zmmRegistry.has(mat)) zmmRegistry.set(mat, []);
        zmmRegistry.get(mat).push(row);
    });

    const me2mRegistry = new Map();
    me2mRawData.forEach(row => {
        const mat = row['Material'] ? String(row['Material']).trim() : '';
        if (!mat) return;
        if (!me2mRegistry.has(mat)) me2mRegistry.set(mat, []);
        me2mRegistry.get(mat).push(row);
    });

    // Step 3: Map items one by one into rows using our modular rules
    const dataRows = [];
    let currentSerial = 1;

    sortedUniqueMaterials.forEach(materialCode => {
        // Isolate file records matching this code completely
        const zmmRecords = zmmRegistry.get(materialCode) || [];
        const me2mRecords = me2mRegistry.get(materialCode) || [];

        // Build row columns by dispatching queries to our rule index
        const processedRow = [
            AnnexureB_Rules.getSerialNumber(currentSerial++, zmmRecords, me2mRecords),
            AnnexureB_Rules.getMaterialCode(materialCode, zmmRecords, me2mRecords),
            AnnexureB_Rules.getOldMaterialCode(zmmRecords, me2mRecords),
            AnnexureB_Rules.getItemDescription(zmmRecords, me2mRecords),
            AnnexureB_Rules.getPopulation(zmmRecords, me2mRecords),
            AnnexureB_Rules.getQtyProposed(zmmRecords, me2mRecords),
            AnnexureB_Rules.getQtyInStock(zmmRecords, me2mRecords),
            AnnexureB_Rules.getSafetyStock(zmmRecords, me2mRecords),
            AnnexureB_Rules.getMandatorySpareQty(zmmRecords, me2mRecords),
            AnnexureB_Rules.getNormalLife(zmmRecords, me2mRecords),
            AnnexureB_Rules.getConsumptionYr4(zmmRecords),
            AnnexureB_Rules.getConsumptionYr3(zmmRecords),
            AnnexureB_Rules.getConsumptionYr2(zmmRecords),
            AnnexureB_Rules.getConsumptionPrevYr(zmmRecords),
            AnnexureB_Rules.getConsumptionCurrYr(zmmRecords),
            AnnexureB_Rules.getFailureRate(zmmRecords, me2mRecords),
            AnnexureB_Rules.getPipelinePoNoDate(me2mRecords),
            AnnexureB_Rules.getPipelinePoQty(me2mRecords),
            AnnexureB_Rules.getPipelinePrNoDate(zmmRecords),
            AnnexureB_Rules.getPipelinePrQty(zmmRecords),
            AnnexureB_Rules.getLastPoNoDate(me2mRecords),
            AnnexureB_Rules.getLastPoItemSlNo(me2mRecords),
            AnnexureB_Rules.getJustification(zmmRecords, me2mRecords)
        ];

        dataRows.push(processedRow);
    });

    // Step 4: Bundle structured top headers with compiled rows exactly as per template layout
    return [
        ...SCHEMA_TEMPLATES.AnnexureB_TopRows,
        SCHEMA_TEMPLATES.AnnexureB_Headers_Row1,
        SCHEMA_TEMPLATES.AnnexureB_Headers_Row2,
        ...dataRows
    ];
}
