// ============================================================
// LOCKED-IN STRUCTURE CONFIGURATION — Annexure B
// ============================================================
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

// ============================================================
// ANNEXURE A GENERATOR
// ============================================================

/**
 * Returns the raw 2D data array for Annexure A.
 * The actual ExcelJS formatting is handled in index.html → exportAnnexureAExcel().
 *
 * Schema  (13 columns  A–M):
 *   Row 1 : ANNEXURE-A : Estimation Sheet         (merged A1:M1, green bg)
 *   Row 2 : Plant/title placeholder               (merged A2:M2)
 *   Row 3 : PR No. / Date                         (merged A3:G3)
 *   Row 4 : Estimated Value                       (merged A4:G4)
 *   Row 5 : PR ECM No.                            (merged A5:G5)
 *   Row 6 : Column headers (row 1 of 2-row header, all cols merged to row 7)
 *   Row 7 : (empty — header row 2, same label spans)
 *   Row 8+ : Data rows
 *   Last  : TOTAL row
 */
function generateAnnexureAData(masterList, zmmRawData, me2mRawData) {
    // Build O(1) lookup maps
    const zmmRegistry = new Map();
    zmmRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (m) {
            if (!zmmRegistry.has(m)) zmmRegistry.set(m, []);
            zmmRegistry.get(m).push(r);
        }
    });

    const me2mRegistry = new Map();
    me2mRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (m) {
            if (!me2mRegistry.has(m)) me2mRegistry.set(m, []);
            me2mRegistry.get(m).push(r);
        }
    });

    // Data rows start at Excel row 8 (rows 1-7 are header/title block)
    const DATA_START_ROW = 8;

    const dataRows = masterList.map((materialCode, idx) => {
        const zmmRecords  = zmmRegistry.get(materialCode)  || [];
        const me2mRecords = me2mRegistry.get(materialCode) || [];
        const excelRow    = DATA_START_ROW + idx;

        return [
            AnnexureA_Rules.getSerialNumber(idx + 1),              // A  S No.
            AnnexureA_Rules.getMaterialCode(materialCode),          // B  Material
            AnnexureA_Rules.getDescription(zmmRecords),             // C  Material Description
            AnnexureA_Rules.getPopulation(),                        // D  Population
            AnnexureA_Rules.getStockQty(zmmRecords),               // E  Stock Qty
            AnnexureA_Rules.getQtyRequested(),                      // F  Qty requested
            AnnexureA_Rules.getUnitOfMeasure(zmmRecords),          // G  Unit of Measure
            AnnexureA_Rules.getLastPoNo(),                          // H  Last PO No.
            AnnexureA_Rules.getLastPoDate(),                        // I  Last PO date
            AnnexureA_Rules.getLPP(),                               // J  LPP
            AnnexureA_Rules.getBudgetaryOffer(),                    // K  Budgetary offer
            AnnexureA_Rules.getEstimatedRate(),                     // L  Estimated Rate
            AnnexureA_Rules.getTotalValueFormula(excelRow),        // M  Total Value (formula)
        ];
    });

    // Total row — TOTAL label spans A:L, SUM formula in M
    const totalExcelRow = DATA_START_ROW + masterList.length;
    const totalRow = ['TOTAL', '', '', '', '', '', '', '', '', '', '', '', `=SUM(M${DATA_START_ROW}:M${totalExcelRow - 1})`];

    return {
        dataRows,
        totalRow,
        dataStartRow: DATA_START_ROW,
        totalRowNumber: totalExcelRow,
        itemCount: masterList.length
    };
}


// ============================================================
// ANNEXURE B GENERATOR
// ============================================================

function generateAnnexureBWorkbook(masterList, zmmRawData, me2mRawData) {
    const zmmRegistry = new Map();
    zmmRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (m) {
            if (!zmmRegistry.has(m)) zmmRegistry.set(m, []);
            zmmRegistry.get(m).push(r);
        }
    });

    const me2mRegistry = new Map();
    me2mRawData.forEach(r => {
        const m = String(r['Material'] || '').trim();
        if (m) {
            if (!me2mRegistry.has(m)) me2mRegistry.set(m, []);
            me2mRegistry.get(m).push(r);
        }
    });

    const dataRows = masterList.map((materialCode, idx) => {
        const zmmRecords  = zmmRegistry.get(materialCode)  || [];
        const me2mRecords = me2mRegistry.get(materialCode) || [];

        return [
            AnnexureB_Rules.getSerialNumber(idx + 1),
            AnnexureB_Rules.getMaterialCode(materialCode),
            AnnexureB_Rules.getOldMaterialCode(),
            AnnexureB_Rules.getItemDescription(zmmRecords, me2mRecords),
            AnnexureB_Rules.getPopulation(),
            AnnexureB_Rules.getQtyProposed(),
            AnnexureB_Rules.getQtyInStock(zmmRecords),
            AnnexureB_Rules.getSafetyStock(),
            AnnexureB_Rules.getMandatorySpareQty(),
            AnnexureB_Rules.getNormalLife(),
            AnnexureB_Rules.getConsumptionYr4(zmmRecords),
            AnnexureB_Rules.getConsumptionYr3(zmmRecords),
            AnnexureB_Rules.getConsumptionYr2(zmmRecords),
            AnnexureB_Rules.getConsumptionPrevYr(zmmRecords),
            AnnexureB_Rules.getConsumptionCurrYr(zmmRecords),
            AnnexureB_Rules.getFailureRate(),
            AnnexureB_Rules.getPipelinePoNoDate(zmmRecords),
            AnnexureB_Rules.getPipelinePoQty(zmmRecords),
            AnnexureB_Rules.getPipelinePrNoDate(zmmRecords),
            AnnexureB_Rules.getPipelinePrQty(zmmRecords),
            AnnexureB_Rules.getLastPoNoDate(),
            AnnexureB_Rules.getLastPoItemSlNo(),
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
