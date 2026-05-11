// utils/export-file/exportReportExcel.ts
import ExcelJS from "exceljs";
import { ReportModel } from "@/models/report/report.response";
import { DateTimeFormat } from "../date/date-time-format";

/**
 * Export an array of ReportModel to Excel and trigger download in the browser
 * @param data Array of report data
 * @param fileName Name of the downloaded file (e.g., "AccountReport.xlsx")
 */
export const exportReportToExcel = async (
  data: ReportModel[],
  fileName: string
) => {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  // Define worksheet columns, with a "No." column for row numbers
  worksheet.columns = [
    { header: "No.", key: "no", width: 8 },
    { header: "ID Number", key: "idNumber", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Remark", key: "remark", width: 40 },
    { header: "Created At", key: "createdAt", width: 25 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows with auto-incrementing row number
  data.forEach((item, index) => {
    const row = worksheet.addRow({
      no: index + 1, // auto row number
      idNumber: item.idNumber,
      status: item.status,
      remark: item.remark,
      createdAt: DateTimeFormat(item.createdAt),
    });

    // Style each row
    row.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  });

  // Auto-filter for all columns
  worksheet.autoFilter = {
    from: "A1",
    to: "E1",
  };

  // Generate Excel file as buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Trigger download in browser
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
