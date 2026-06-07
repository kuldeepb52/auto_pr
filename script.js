async function processData() {
    const mathistFile = document.getElementById('mathist').files[0];
    const me2mFile = document.getElementById('me2m').files[0];

    // 1. Fetch the permanent schema file from your website
    const response = await fetch('Annexure_B_Schema.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const mathistData = await readExcel(mathistFile);
    const me2mData = await readExcel(me2mFile);

    const materials = [...new Set(mathistData.map(r => r.Material))].sort();

    // 2. Populate the existing schema
    materials.forEach((mat, idx) => {
        const row = idx + 2; // Assuming data starts at row 2
        const data = calculateRowData(mat, mathistData, me2mData);

        // Map data to the exact columns of your permanent schema
        sheet[`A${row}`] = { t: 'n', v: idx + 1 };
        sheet[`B${row}`] = { t: 's', v: mat };
        sheet[`D${row}`] = { t: 's', v: data.desc };
        sheet[`F${row}`] = { t: 'n', v: data.stock };
        sheet[`G${row}`] = { t: 'n', v: data.totalCons };
        sheet[`P${row}`] = { t: 's', v: data.poDoc }; // P (PO Doc)
        sheet[`Q${row}`] = { t: 'n', v: data.poQty }; // Q (PO Qty)
        sheet[`R${row}`] = { t: 's', v: data.prDoc }; // R (PR Doc)
        sheet[`S${row}`] = { t: 's', v: data.prDate };// S (PR Date)
        sheet[`T${row}`] = { t: 'n', v: data.prQty }; // T (PR Qty)
        sheet[`U${row}`] = { t: 's', v: data.latestPoDoc }; // U
        sheet[`V${row}`] = { t: 's', v: data.latestPoItem }; // V
        sheet[`W${row}`] = { t: 's', v: data.latestPoDate }; // W
    });

    // 3. Trigger download of the filled schema
    XLSX.writeFile(workbook, "Filled_Annexure_B.xlsx");
}

// Helper to calculate row data
function calculateRowData(mat, mathist, me2m) {
    const rows = mathist.filter(r => r.Material === mat);
    const mRow = me2m.filter(r => r.Material === mat).sort((a,b) => new Date(b["Document Date"]) - new Date(a["Document Date"]))[0];
    
    return {
        desc: rows[0]?.["Material Description"] || "NA",
        stock: rows.reduce((a, r) => a + (Number(r.Stock) || 0), 0),
        totalCons: rows.reduce((a, r) => a + (Number(r["Cons-Curr Fin. Year"]) || 0), 0),
        prDoc: rows.find(r => r["Doc. Type"] === "PurRqs")?.["Doc. Detail"] || "NA",
        prDate: rows.find(r => r["Doc. Type"] === "PurRqs")?.["Req. date"] || "NA",
        prQty: rows.find(r => r["Doc. Type"] === "PurRqs")?.["Quantity"] || 0,
        poDoc: rows.find(r => r["Doc. Type"] === "POitem")?.["Doc. Detail"] || "NA",
        poQty: rows.find(r => r["Doc. Type"] === "POitem")?.["Quantity"] || 0,
        latestPoDoc: mRow?.["Purchasing Document"] || "NA",
        latestPoItem: mRow?.["Item"] || "NA",
        latestPoDate: mRow?.["Document Date"] || "NA"
    };
}
