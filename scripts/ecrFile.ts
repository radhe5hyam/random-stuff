document
  .getElementById("fileInput")!
  .addEventListener("change", handleFileSelect);
document
  .getElementById("downloadBtn")!
  .addEventListener("click", downloadTextFile);
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

  // Check if the first row contains the required columns
  const firstRowCells = rows[0].split(",");
  const isHeaderRow = requiredColumns.every((col) =>
    firstRowCells.includes(col)
  );

  if (!isHeaderRow) {
    // Add the required columns as the header row
    const headerRow = document.createElement("tr");
    requiredColumns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
  }

  rows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    const cells = row.split(",");

    cells.forEach((cell, cellIndex) => {
      const td = document.createElement(
        isHeaderRow && rowIndex === 0 ? "th" : "td"
      );
      td.contentEditable = (!isHeaderRow || rowIndex !== 0).toString();
      td.textContent = cell.trim(); // Trim the cell content

      // Add event listeners for EPF WAGES and EPS WAGES cells
      if (
        requiredColumns[cellIndex] === "EPF WAGES" ||
        requiredColumns[cellIndex] === "EPS WAGES"
      ) {
        td.addEventListener("input", () => updateContributions(tr, cellIndex));
      }

      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  // Ensure the required columns are present if the header row was missing
  if (!isHeaderRow) {
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
}

function updateContributions(row: HTMLTableRowElement, cellIndex: number) {
  const cells = row.cells;
  const epfWagesIndex = requiredColumns.indexOf("EPF WAGES");
  const epsWagesIndex = requiredColumns.indexOf("EPS WAGES");
  const epfContriIndex = requiredColumns.indexOf("EPF CONTRI REMITTED");
  const epsContriIndex = requiredColumns.indexOf("EPS CONTRI REMITTED");
  const epfEpsDiffIndex = requiredColumns.indexOf("EPF EPS DIFF REMITTED");

  if (cellIndex === epfWagesIndex) {
    const epfWages = parseFloat(cells[epfWagesIndex].textContent || "0");
    const epfContri = Math.round(epfWages * 0.12);
    cells[epfContriIndex].textContent = epfContri.toString();
  }

  if (cellIndex === epsWagesIndex) {
    const epsWages = parseFloat(cells[epsWagesIndex].textContent || "0");
    const epsContri = Math.round(epsWages * 0.0833);
    cells[epsContriIndex].textContent = epsContri.toString();
  }

  const epfContri = parseFloat(cells[epfContriIndex].textContent || "0");
  const epsContri = parseFloat(cells[epsContriIndex].textContent || "0");
  const epfEpsDiff = Math.round(epfContri - epsContri);
  cells[epfEpsDiffIndex].textContent = epfEpsDiff.toString();
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

    // Add event listeners for EPF WAGES and EPS WAGES cells
    if (
      requiredColumns[i] === "EPF WAGES" ||
      requiredColumns[i] === "EPS WAGES"
    ) {
      newCell.addEventListener("input", () => updateContributions(newRow, i));
    }
  }
}

function downloadTextFile() {
  const table = document.getElementById("csvTable") as HTMLTableElement;
  const rows = Array.from(table.rows);
  const text = rows
    .slice(1) // Skip the title row
    .filter((row) => {
      const cells = Array.from(row.cells);
      return cells.every((cell) => cell.textContent?.trim() !== "");
    })
    .map((row) => {
      const cells = Array.from(row.cells);
      return cells.map((cell) => cell.textContent).join("#~#");
    })
    .join("\n");

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ecr.txt";
  a.click();
  URL.revokeObjectURL(url);
}
