async function runProcess() {
    // Get the uploaded files from the HTML inputs
    const mathistFile = document.getElementById('mathist').files[0];
    const me2mFile = document.getElementById('me2m').files[0];

    // Check if the user actually selected files
    if (!mathistFile || !me2mFile) { alert("Please upload both files"); return; }

    // Fetch the template file stored in your GitHub repository
    // Use a leading slash to ensure it looks from the root of the project
     const response = await fetch('/auto_pr/Annexure_B_Schema.xlsx');
    const arrayBuffer = await response.arrayBuffer(); // Convert file to binary data
    const workbook = XLSX.read(arrayBuffer, { type: 'array' }); // Read the Excel file
    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Select the first tab

    // Read the user-uploaded Excel files into JSON format
    const mathistData = await readExcel(mathistFile);
    const me2mData = await readExcel(me2mFile);

    // Get a unique list of materials to loop through
    const materials = [...new Set(mathistData.map(r => r.Material))].sort();

    // Loop through each material to find its specific data
    materials.forEach((mat, idx) => {
        const row = idx + 7; // Start filling data from Row 7 (preserving rows 1-6)
        
        // Filter Mathist for the current material
        const rows = mathistData.filter(r => r.Material === mat);
        
        // Find the most recent PO for this material in ME2M
        const mRow = me2mData.filter(r => r.Material === mat)
                             .sort((a,b) => new Date(b["Document Date"]) - new Date(a["Document Date"]))[0];
        
        // Look for PR and PO details in the Mathist file
        const pr = rows.find(r => r["Doc. Type"] === "PurRqs") || {};
        const po = rows.find(r => r["Doc. Type"] === "POitem") || {};

        // Assign data to specific cells in the sheet object
        sheet[`A${row}`] = { t: 'n', v: idx + 1 }; // S No.
        sheet[`B${row}`] = { t: 's', v: mat };     // Material
        sheet[`P${row}`] = { t: 's', v: po["Doc. Detail"] || "NA" }; // PO Doc
        sheet[`Q${row}`] = { t: 'n', v: po["Quantity"] || 0 };       // PO Qty
        sheet[`R${row}`] = { t: 's', v: pr["Doc. Detail"] || "NA" }; // PR Doc
        sheet[`S${row}`] = { t: 's', v: pr["Req. date"] || "NA" };   // PR Date
        sheet[`T${row}`] = { t: 'n', v: pr["Quantity"] || 0 };       // PR Qty
        sheet[`U${row}`] = { t: 's', v: mRow?.["Purchasing Document"] || "NA" }; // Latest PO
        sheet[`V${row}`] = { t: 's', v: mRow?.["Item"] || "NA" };                // Latest PO Item
        sheet[`W${row}`] = { t: 's', v: mRow?.["Document Date"] || "NA" };       // Latest PO Date
    });

    // Update the Excel range to include the newly added rows
    sheet['!ref'] = `A1:W${materials.length + 6}`; 

    // Generate the final download
    XLSX.writeFile(workbook, "Filled_Annexure_B.xlsx");
}

// Helper function to read uploaded Excel files
function readExcel(file) {
    return new Promise((resolve) => {
        const reader = new FileReader(); // Create a file reader
        reader.onload = (e) => { // Triggered when file is read
            const data = new Uint8Array(e.target.result); // Get binary data
            const wb = XLSX.read(data, {type: 'array'}); // Read Excel
            resolve(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])); // Convert to JSON
        };
        reader.readAsArrayBuffer(file); // Start reading the file
    });
}
