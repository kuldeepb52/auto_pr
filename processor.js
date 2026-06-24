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
    ],
    // ADDED FOOTER NOTES
    AnnexureB_FooterRows: [
        ['* This data is to be given where the item is a critical spare as approved by ED (OS) / Minimum Qty. to be maintained at site for area of critical application'],
        ['Note', '1. Please take care that sequence of items as in the PR is also maintained in this sheet'],
        ['', '2. This sheet is required to be filled for ZSPR type materials only.']
    ]
};

/**
 * PRIMARY WORKBOOK COMPILER
 */
function generateAnnexureBWorkbook(zmmRawData, me2mRawData) {
    // ... [Keep Step 1, Step 2, and Step 3 exactly as they are] ...

    // Step 4: Bundle structured top headers, compiled rows, and footers exactly as per template layout
    return [
        ...SCHEMA_TEMPLATES.AnnexureB_TopRows,
        SCHEMA_TEMPLATES.AnnexureB_Headers_Row1,
        SCHEMA_TEMPLATES.AnnexureB_Headers_Row2,
        ...dataRows,
        ...SCHEMA_TEMPLATES.AnnexureB_FooterRows // Inject footers at the very bottom
    ];
}
