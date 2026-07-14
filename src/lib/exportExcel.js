import * as XLSX from 'xlsx'

// Exports a single table to a downloadable .xlsx file. Only ever writes
// data we generated ourselves — never parses external/untrusted files.
export function exportTableToExcel({ filename, sheetName = 'Sheet1', columns, rows }) {
  const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}
