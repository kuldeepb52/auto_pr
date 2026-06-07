async function processData() {
    const mathistFile = document.getElementById('mathist').files[0];
    const me2mFile = document.getElementById('me2m').files[0];

    const mathistData = await readExcel(mathistFile);
    const me2mData = await readExcel(me2mFile);

    const materials = [...new Set(mathistData.map(r => r.Material))].sort();

    const result = materials.map((mat, idx) => {
        const rows = mathistData.filter(r => r.Material === mat);
        const me2mRows = me2mData.filter(r => r.Material === mat)
                                 .sort((a, b) => new Date(b["Document Date"]) - new Date(a["Document Date"]));
        
        const prRow = rows.find(r => r["Doc. Type"] === "PurRqs");
        const poRow = rows.find(r => r["Doc. Type"] === "POitem");

        return {
            "S No.": idx + 1,
            "Material": mat,
            "Description": rows[0]?.["Material Description"] || "NA",
            "Stock": rows.reduce((acc, r) => acc + (Number(r.Stock) || 0), 0),
            "Total 5 Year Consumption": (Number(rows[0]?.["Cons-Curr Fin. Yr - 4"]) || 0) + (Number(rows[0]?.["Cons-Curr Fin. Yr  -3"]) || 0) + (Number(rows[0]?.["Cons-Curr Fin. Yr - 2"]) || 0) + (Number(rows[0]?.["Cons-Prev Fin. Yr."]) || 0) + (Number(rows[0]?.["Cons-Curr Fin. Year"]) || 0),
            "PR_Doc": prRow ? prRow["Doc. Detail"] : "NA",
            "PR_Date": prRow ? prRow["Req. date"] : "NA",
            "PR_Qty": prRow ? prRow["Quantity"] : "NA",
            "POItem_Doc": poRow ? poRow["Doc. Detail"] : "NA",
            "POItem_Qty": poRow ? poRow["Quantity"] : "NA",
            "LatestPO_Doc": me2mRows[0]?.["Purchasing Document"] || "NA",
            "LatestPO_Item": me2mRows[0]?.["Item"] || "NA",
            "LatestPO_Date": me2mRows[0]?.["Document Date"] || "NA"
        };
    });

    // Export to Excel
    const ws = XLSX.utils.json_to_sheet(result);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AnnexureB");
    XLSX.writeFile(wb, "Annexure_B_Generated.xlsx");
}

function readExcel(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            resolve(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
        };
        reader.readAsArrayBuffer(file);
    });
}
