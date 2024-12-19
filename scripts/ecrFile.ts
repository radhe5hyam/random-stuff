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

  // Clear existing table rows
  table.innerHTML = "";

  // Check if the first row matches the required columns
  const firstRow = rows[0].split(",").map((cell) => cell.trim());
  const isHeaderPresent = requiredColumns.every(
    (col, index) => col === firstRow[index]
  );

  // Add the header row to the table
  const headerRow = table.insertRow();
  requiredColumns.forEach((col) => {
    const cell = headerRow.insertCell();
    cell.textContent = col;
    cell.style.fontWeight = "bold"; // Optional: make header bold
  });

  const startIndex = isHeaderPresent ? 1 : 0;
  for (let i = startIndex; i < rows.length; i++) {
    const row = table.insertRow();
    const cells = rows[i].split(",").map((cell) => cell.trim());
    cells.forEach((cell, cellIndex) => {
      const cellElement = row.insertCell();
      if (i === 0 && isHeaderPresent) {
        cellElement.textContent = cell;
        cellElement.style.fontWeight = "bold"; // Optional: make header bold
      } else {
        cellElement.contentEditable = "true";
        cellElement.innerText = cell;
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
