// Declare the global XLSX variable provided by the CDN
declare const XLSX: any;

const xlsTable = document.getElementById("xlsTable") as HTMLTableElement;
const downloadButton = document.getElementById(
  "downloadButton"
) as HTMLButtonElement;
const addRowButton = document.getElementById(
  "addRowButton"
) as HTMLButtonElement;

// Function to add a new row to the table
addRowButton.addEventListener("click", () => {
  const newRow = document.createElement("tr");

  // Define the number of columns
  const columnCount = 6;

  for (let i = 0; i < columnCount; i++) {
    const newCell = document.createElement("td");

    if (i === 5) {
      // Add a calendar widget for the date column
      const input = document.createElement("input");
      input.type = "date";
      input.style.width = "100%";
      newCell.appendChild(input);
    } else {
      // Add a text input for other columns
      const input = document.createElement("input");
      input.type = "text";
      input.style.width = "100%";
      newCell.appendChild(input);
    }

    newRow.appendChild(newCell);
  }

  xlsTable.querySelector("tbody")?.appendChild(newRow);
});

// Function to download the table as an XLS file
downloadButton.addEventListener("click", () => {
  const tableData: string[][] = [];

  // Add column headers
  const headers = [
    "IP Number",
    "IP Name",
    "No of Days for which wages paid/payable during the month",
    "Total Monthly Wages",
    "Reason Code for Zero workings days",
    "Last Working Day",
  ];
  tableData.push(headers);

  // Add table rows
  Array.from(xlsTable.querySelectorAll("tbody tr")).forEach((row) => {
    const rowData: string[] = [];
    Array.from((row as HTMLTableRowElement).cells).forEach((cell) => {
      const input = (cell as HTMLTableCellElement).querySelector("input");
      rowData.push(input ? input.value : "");
    });
    tableData.push(rowData);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(tableData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, "ModifiedFile.xls");
});
