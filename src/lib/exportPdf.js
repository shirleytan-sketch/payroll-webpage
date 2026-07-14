import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Exports one or more tables to a downloadable PDF, with a title and
// optional subtitle. Each table gets its own autoTable call so multi-section
// reports (e.g. Shift A + Shift B) land on sensible page breaks.
export function exportTablesToPdf({ filename, title, subtitle, orientation = 'landscape', tables }) {
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' })
  let cursorY = 40

  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text(title, 40, cursorY)
  cursorY += 18

  if (subtitle) {
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(subtitle, 40, cursorY)
    cursorY += 14
  }

  tables.forEach((table, i) => {
    if (table.heading) {
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.text(table.heading, 40, cursorY + 10)
      cursorY += 20
    }
    autoTable(doc, {
      startY: cursorY,
      head: [table.columns],
      body: table.rows,
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 40, right: 40 },
      didParseCell: table.highlight
        ? (data) => {
            if (data.section === 'body' && table.highlight(data.row.index, data.column.index)) {
              data.cell.styles.fillColor = [253, 224, 71]
            }
          }
        : undefined,
    })
    cursorY = doc.lastAutoTable.finalY + 24
    if (i < tables.length - 1 && cursorY > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage()
      cursorY = 40
    }
  })

  doc.save(filename)
}
