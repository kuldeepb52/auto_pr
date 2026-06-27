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
    ],
    
    // NEW: Annexure A Structure
    AnnexureA_TopRows: [
        ['ANNEXURE-A : Estimation Sheet'],
        ['Project / ECM Description : xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'],
        ['PR No. : xxxxxx / Date: xxxxxx'],
        ['Estimated Value : Rs. xxxxxx'],
        ['PR ECM No. : xxxxxxxxxxxxxxxxxxxxxxx']
    ],
    AnnexureA_Headers: [
        'S No.', 'Material', 'Material Description', 'Population', 
        'Stock Qty', 'Qty requested', 'Unit of Measure', 'Last PO No.', 
        'Last PO date', 'LPP', 'Budgetary offer', 'Estimated Rate', 'Total Value'
    ]
};

function generateAnnexureBWorkbook(masterList, zmmRawData, me2mRawData) {
    const zmmRegistry = new Map();
    zmmRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (m) { if (!zmmRegistry.has(m)) zmmRegistry.set(m, []); zmmRegistry.get(m).push(r); }
    });

    const me2mRegistry = new Map();
    me2mRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (m) { if (!me2mRegistry.has(m)) me2mRegistry.set(m, []); me2mRegistry.get(m).push(r); }
    });

    const dataRows = masterList.map((materialCode, idx) => {
        const zmmRecords = zmmRegistry.get(materialCode) || [];
        const me2mRecords = me2mRegistry.get(materialCode) || [];
        return [
            AnnexureB_Rules.getSerialNumber(idx + 1), AnnexureB_Rules.getMaterialCode(materialCode), AnnexureB_Rules.getOldMaterialCode(),
            AnnexureB_Rules.getItemDescription(zmmRecords, me2mRecords), AnnexureB_Rules.getPopulation(), AnnexureB_Rules.getQtyProposed(),
            AnnexureB_Rules.getQtyInStock(zmmRecords), AnnexureB_Rules.getSafetyStock(), AnnexureB_Rules.getMandatorySpareQty(),
            AnnexureB_Rules.getNormalLife(), AnnexureB_Rules.getConsumptionYr4(zmmRecords), AnnexureB_Rules.getConsumptionYr3(zmmRecords),
            AnnexureB_Rules.getConsumptionYr2(zmmRecords), AnnexureB_Rules.getConsumptionPrevYr(zmmRecords), AnnexureB_Rules.getConsumptionCurrYr(zmmRecords),
            AnnexureB_Rules.getFailureRate(), AnnexureB_Rules.getPipelinePoNoDate(zmmRecords), AnnexureB_Rules.getPipelinePoQty(zmmRecords),
            AnnexureB_Rules.getPipelinePrNoDate(zmmRecords), AnnexureB_Rules.getPipelinePrQty(zmmRecords), AnnexureB_Rules.getLastPoNoDate(),
            AnnexureB_Rules.getLastPoItemSlNo(), AnnexureB_Rules.getJustification(zmmRecords, me2mRecords)
        ];
    });

    return [...SCHEMA_TEMPLATES.AnnexureB_TopRows, SCHEMA_TEMPLATES.AnnexureB_Headers_Row1, SCHEMA_TEMPLATES.AnnexureB_Headers_Row2, ...dataRows, ...SCHEMA_TEMPLATES.AnnexureB_FooterRows];
}

function generateAnnexureAWorkbook(masterList, zmmRawData) {
    const zmmRegistry = new Map();
    zmmRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (m) { if (!zmmRegistry.has(m)) zmmRegistry.set(m, []); zmmRegistry.get(m).push(r); }
    });

    const dataRows = masterList.map((materialCode, idx) => {
        const zmmRecords = zmmRegistry.get(materialCode) || [];
        return [
            AnnexureA_Rules.getSerialNumber(idx + 1), AnnexureA_Rules.getMaterialCode(materialCode), AnnexureA_Rules.getItemDescription(zmmRecords),
            AnnexureA_Rules.getPopulation(), AnnexureA_Rules.getQtyInStock(zmmRecords), AnnexureA_Rules.getQtyRequested(),
            AnnexureA_Rules.getUnitOfMeasure(), AnnexureA_Rules.getLastPoNo(), AnnexureA_Rules.getLastPoDate(),
            AnnexureA_Rules.getLPP(), AnnexureA_Rules.getBudgetaryOffer(), AnnexureA_Rules.getEstimatedRate(), AnnexureA_Rules.getTotalValue()
        ];
    });

    return [
        ...SCHEMA_TEMPLATES.AnnexureA_TopRows,
        SCHEMA_TEMPLATES.AnnexureA_Headers,
        ...dataRows,
        ['', '', '', '', '', '', '', '', '', '', '', 'TOTAL:', ''] // Footer Row for Annexure A
    ];
}
