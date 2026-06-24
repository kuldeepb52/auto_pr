const SCHEMA_TEMPLATES = {
    AnnexureB_TopRows: [
        ['Material Procurement Justification sheet'],
        ['Procurement of xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'],
        ['PRNo.xxxxxx / Date:xxxxxx', '', '', 'Value of  indent in (Rs.): xxxxx/-'],
        ['1','2','3','4','5','6','7','8','9','10','11','','','','','12','13','','14','','15','16','17']
    ],
    AnnexureB_Headers_Row1: ['Sl . No.', 'Material Code', 'Old Material code', 'Item Description', 'Population', 'Qty Proposed', 'Stock', 'Safety Stock', 'Mandatory Spare', 'Life', 'Consumption Grid', '', '', '', '', 'Failure Rate', 'Pipeline PO', '', 'Pipeline PR', '', 'Last PO', 'Last Item', 'Justification'],
    AnnexureB_Headers_Row2: ['', '', '', '', '', '', '', '', '', '', 'Yr-4', 'Yr-3', 'Yr-2', 'Prev', 'Curr', '', 'PO', 'Qty', 'PR', 'Qty', '', '', ''],
    AnnexureB_FooterRows: [['* Disclaimer...'], ['Note', '1. ...'], ['', '2. ...']]
};

function generateAnnexureBWorkbook(zmmData, me2mData) {
    const sortedMaterials = [...new Set(zmmData.map(r => String(r['Material']).trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));
    
    const zmmReg = new Map(); zmmData.forEach(r => { const m = String(r['Material']).trim(); if(!zmmReg.has(m)) zmmReg.set(m, []); zmmReg.get(m).push(r); });
    const me2mReg = new Map(); me2mData.forEach(r => { const m = String(r['Material']).trim(); if(!me2mReg.has(m)) me2mReg.set(m, []); me2mReg.get(m).push(r); });

    const rows = sortedMaterials.map((mat, i) => [
        i + 1, mat, AnnexureB_Rules.getOldMaterial(zmmReg.get(mat)), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]);

    return [...SCHEMA_TEMPLATES.AnnexureB_TopRows, SCHEMA_TEMPLATES.AnnexureB_Headers_Row1, SCHEMA_TEMPLATES.AnnexureB_Headers_Row2, ...rows, ...SCHEMA_TEMPLATES.AnnexureB_FooterRows];
}
