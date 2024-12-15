document
  .getElementById("fileInput")!
  .addEventListener("change", handleFileSelect);
document.getElementById("downloadBtn")!.addEventListener("click", downloadCSV);
document.getElementById("addRowBtn")!.addEventListener("click", addEmptyRow);

const requiredColumns = [
  "UAN",
  "MEMBER NAME",
  "GROSS WAGES",
  "EPF WAGES",
  "EPS WAGES",
  "EDLI WAGES",
  "EPF CONTRI REMITTED",
  "EPS CONTRI REMITTED",
  "EPF EPS DIFF REMITTED",
  "NCP DAYS",
  "REFUND OF ADVANCES",
];

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const contents = e.target?.result as string;
    displayCSV(contents);
    document.getElementById("addRowBtn")!.style.display = "block"; // Show the plus button
    document.getElementById("downloadBtn")!.style.display = "block"; // Show the download button
  };

  reader.readAsText(file);
}

function displayCSV(csv: string) {
  const rows = csv.split("\n");
  const table = document.getElementById("csvTable") as HTMLTableElement;
  table.innerHTML = "";

  rows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    const cells = row.split(",");

    cells.forEach((cell, cellIndex) => {
      const td = document.createElement(rowIndex === 0 ? "th" : "td");
      td.contentEditable = (rowIndex !== 0).toString();
      td.textContent = cell.trim(); // Trim the cell content
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  // Ensure the required columns are present
  const headerRow = table.rows[0];
  const headers = Array.from(headerRow.cells).map((cell) =>
    cell.textContent?.trim()
  ); // Trim the header content
  requiredColumns.forEach((col) => {
    if (!headers.includes(col)) {
      const th = document.createElement("th");
      th.textContent = col;
      headerRow.appendChild(th);
    }
  });
}

function addEmptyRow() {
  const table = document.getElementById("csvTable") as HTMLTableElement;
  const newRow = table.insertRow();
  const headerRow = table.rows[0];
  const numCols = headerRow.cells.length;

  for (let i = 0; i < numCols; i++) {
    const newCell = newRow.insertCell();
    newCell.contentEditable = "true";
    newCell.textContent = ""; // Empty cell
  }
}

function downloadCSV() {
  const table = document.getElementById("csvTable") as HTMLTableElement;
  const rows = Array.from(table.rows);
  const csv = rows
    .map((row) => {
      const cells = Array.from(row.cells);
      return cells.map((cell) => cell.textContent).join(",");
    })
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modified.csv";
  a.click();
  URL.revokeObjectURL(url);
}
