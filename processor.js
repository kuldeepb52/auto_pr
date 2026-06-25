// LOCKED-IN STRUCTURE CONFIGURATION
const SCHEMA_TEMPLATES = {
    AnnexureB_TopRows: [
        ['Material Procurement Justification sheet'],
        ['Procurement of xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'],
        ['PRNo.xxxxxx / Date:xxxxxx', '', '', 'Value of  indent in (Rs.): xxxxx/-'],
        ['1','2','3','4','5','6','7','8','9','10','11','','','','','12','13','','14','','15','16','17']
    ],
    AnnexureB_Headers_Row1: [
        'Sl . No.', 'Material Code', 'Old Material code if any', 'Item Description', 
        'Population of Item ', 'Quantity Proposed Indent ', 'Quantity in Stock as on date', 
        'Saftey Stock*\n(Minimum Qty. to be maintained at site )', 'Quantity under Mandatory Spare List as on date', 
        'Normal Life of item (Year)', 'Actual Consumption in last 5 Years ', '', '', '', '', 
        'Failure rate (frequent /normal)', 'Pipeline PO ', '', 'Pipeline PR', '', 
        'Last PO No. & Date', 'Last Po. Item Sl. No.', 'Justification of Qty'
    ],
    AnnexureB_Headers_Row2: [
        '', '', '', '', '', '', '', '', '', '', 
        'Curr. Fin Yr-4', 'Curr. Fin Yr-3', 'Curr. Fin Yr-2', 'Previous Fin Yr', 'Curr. Fin Year', 
        '', 'PO No. /Date ', 'Qty ', 'PRNo. /Date ', 'Qty ', '', '', ''
    ],
    AnnexureB_FooterRows: [
        ['* This data is to be given where the item is a critical spare as approved by ED (OS) / Minimum Qty. to be maintained at site for area of critical application'],
        ['Note', '1. Please take care that sequence of items as in the PR is also maintained in this sheet'],
        ['', '2. This sheet is required to be filled for ZSPR type materials only.']
    ]
};

function generateAnnexureBWorkbook(zmmRawData, me2mRawData) {
    // Extract unique clean materials
    const sortedMaterials = [...new Set(zmmRawData.map(r => String(r['Material'] || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    // Group items into Maps for O(1) performance lookup
    const zmmRegistry = new Map();
    zmmRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (!zmmRegistry.has(m)) zmmRegistry.set(m, []);
        zmmRegistry.get(m).push(r);
    });

    const me2mRegistry = new Map();
    me2mRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (!me2mRegistry.has(m)) me2mRegistry.set(m, []);
        me2mRegistry.get(m).push(r);
    });

    // Execute generation mapping loop
    const dataRows = sortedMaterials.map((materialCode, idx) => {
        const zmmRecords = zmmRegistry.get(materialCode) || [];
        const me2mRecords = me2mRegistry.get(materialCode) || [];

        return [
            AnnexureB_Rules.getSerialNumber(idx + 1, zmmRecords, me2mRecords),
            AnnexureB_Rules.getMaterialCode(materialCode, zmmRecords, me2mRecords),
            AnnexureB_Rules.getOldMaterialCode(zmmRecords, me2mRecords),
            AnnexureB_Rules.getItemDescription(zmmRecords, me2mRecords), // Column 4 [ACTIVE]
            AnnexureB_Rules.getPopulation(zmmRecords, me2mRecords),
            AnnexureB_Rules.getQtyProposed(zmmRecords, me2mRecords),
            AnnexureB_Rules.getQtyInStock(zmmRecords, me2mRecords),       // Column 7 [ACTIVE]
            AnnexureB_Rules.getSafetyStock(zmmRecords, me2mRecords),
            AnnexureB_Rules.getMandatorySpareQty(zmmRecords, me2mRecords),
            AnnexureB_Rules.getNormalLife(zmmRecords, me2mRecords),
            AnnexureB_Rules.getConsumptionYr4(zmmRecords),               // Column 11-A [ACTIVE]
            AnnexureB_Rules.getConsumptionYr3(zmmRecords),               // Column 11-B [ACTIVE]
            AnnexureB_Rules.getConsumptionYr2(zmmRecords),               // Column 11-C [ACTIVE]
            AnnexureB_Rules.getConsumptionPrevYr(zmmRecords),             // Column 11-D [ACTIVE]
            AnnexureB_Rules.getConsumptionCurrYr(zmmRecords),             // Column 11-E [ACTIVE]
            AnnexureB_Rules.getFailureRate(zmmRecords, me2mRecords),
            AnnexureB_Rules.getPipelinePoNoDate(me2mRecords),
            AnnexureB_Rules.getPipelinePoQty(me2mRecords),
            AnnexureB_Rules.getPipelinePrNoDate(zmmRecords),
            AnnexureB_Rules.getPipelinePrQty(zmmRecords),
            AnnexureB_Rules.getLastPoNoDate(me2mRecords),
            AnnexureB_Rules.getLastPoItemSlNo(me2mRecords),
            AnnexureB_Rules.getJustification(zmmRecords, me2mRecords)
        ];
    });

    return [
        ...SCHEMA_TEMPLATES.AnnexureB_TopRows,
        SCHEMA_TEMPLATES.AnnexureB_Headers_Row1,
        SCHEMA_TEMPLATES.AnnexureB_Headers_Row2,
        ...dataRows,
        ...SCHEMA_TEMPLATES.AnnexureB_FooterRows
    ];
}
