import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

// Define user data structure
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string | Date;
}

interface AllUsers {
  content: User[];
}

// Enhanced ExcelColumn interface
export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  type?: "text" | "number" | "date" | "boolean" | "currency" | "percentage";
  format?: string;
  style?: Partial<ExcelJS.Style>;
}

export interface ExcelSheet {
  name: string;
  data: any[];
  columns: ExcelColumn[];
  autoFilter?: boolean;
  freezeRows?: number;
  sortBy?: Array<{ key: string; order: "asc" | "desc" }>;
}

interface ExcelExportOptions {
  filename?: string;
  title?: string;
  author?: string;
  useAlternateRows?: boolean;
  protection?: {
    password?: string;
    deleteRows?: boolean;
    selectLockedCells?: boolean;
    selectUnlockedCells?: boolean;
  };
}

// Professional Excel Exporter with complete table borders
export class ExcelExporter {
  private workbook: ExcelJS.Workbook;
  private options: ExcelExportOptions;

  // Visible borders for all cells - changed to darker color
  private readonly CELL_BORDER_STYLE = {
    top: { style: "thin" as const, color: { argb: "FF666666" } },
    left: { style: "thin" as const, color: { argb: "FF666666" } },
    bottom: { style: "thin" as const, color: { argb: "FF666666" } },
    right: { style: "thin" as const, color: { argb: "FF666666" } },
  };

  // Thick outer borders
  private readonly OUTER_BORDER_STYLE = {
    style: "medium" as const,
    color: { argb: "FF000000" },
  };
  // Professional styling
  private readonly STYLES = {
    header: {
      font: {
        name: "Calibri",
        size: 11,
        bold: true,
        color: { argb: "FF000000" },
      },
      fill: {
        type: "pattern" as const,
        pattern: "solid" as const,
        fgColor: { argb: "FFC6E0B4" }, // green background
      },
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    },

    dataCell: {
      font: { name: "Calibri", size: 11, color: { argb: "FF000000" } },
      alignment: { vertical: "middle" as const, wrapText: false },
    },

    alternateRow: {
      fill: {
        type: "pattern" as const,
        pattern: "solid" as const,
        fgColor: { argb: "FFF8F9FA" },
      },
    },
  };

  constructor(options: ExcelExportOptions = {}) {
    this.workbook = new ExcelJS.Workbook();
    this.options = options;
    this.setWorkbookProperties();
  }

  private setWorkbookProperties() {
    this.workbook.creator = this.options.author || "Excel Exporter";
    this.workbook.lastModifiedBy = this.options.author || "Excel Exporter";
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    this.workbook.title = this.options.title || "User Data Export";
  }

  public addSheet(sheetConfig: ExcelSheet): ExcelJS.Worksheet {
    const worksheet = this.workbook.addWorksheet(sheetConfig.name);

    // Sort data if needed
    let processedData = [...sheetConfig.data];
    if (sheetConfig.sortBy) {
      processedData.sort((a, b) => {
        for (const sort of sheetConfig.sortBy!) {
          const aValue = a[sort.key];
          const bValue = b[sort.key];
          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    // Configure columns
    worksheet.columns = sheetConfig.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // Style header row with borders
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    sheetConfig.columns.forEach((_, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.style = this.STYLES.header;
      cell.border = this.CELL_BORDER_STYLE;
    });

    // Add data rows with borders
    processedData.forEach((row, rowIndex) => {
      const excelRow = worksheet.getRow(rowIndex + 2);
      excelRow.height = 20;

      sheetConfig.columns.forEach((col, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        let value = row[col.key];

        this.applyTypeFormatting(cell, value, col);

        let cellStyle: Partial<ExcelJS.Style> = {
          ...this.STYLES.dataCell,
          alignment: {
            horizontal: this.getAlignmentForColumn(col),
            vertical: "middle",
          },
        };

        if (this.options.useAlternateRows && rowIndex % 2 === 1) {
          cellStyle.fill = this.STYLES.alternateRow.fill;
        }

        if (col.style) {
          cellStyle = { ...cellStyle, ...col.style };
        }

        cell.style = cellStyle;

        // Apply borders to every cell
        cell.border = this.CELL_BORDER_STYLE;
      });
    });

    // Apply thicker outer border to make table boundary more prominent
    this.applyOuterBorder(
      worksheet,
      1,
      processedData.length + 1,
      1,
      sheetConfig.columns.length
    );

    // Configure sheet properties
    this.configureSheet(worksheet, sheetConfig, processedData.length + 1);

    return worksheet;
  }

  private applyOuterBorder(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number
  ) {
    // Top border
    for (let col = startCol; col <= endCol; col++) {
      const cell = worksheet.getCell(startRow, col);
      cell.border = {
        ...cell.border,
        top: this.OUTER_BORDER_STYLE,
      };
    }

    // Bottom border
    for (let col = startCol; col <= endCol; col++) {
      const cell = worksheet.getCell(endRow, col);
      cell.border = {
        ...cell.border,
        bottom: this.OUTER_BORDER_STYLE,
      };
    }

    // Left border
    for (let row = startRow; row <= endRow; row++) {
      const cell = worksheet.getCell(row, startCol);
      cell.border = {
        ...cell.border,
        left: this.OUTER_BORDER_STYLE,
      };
    }

    // Right border
    for (let row = startRow; row <= endRow; row++) {
      const cell = worksheet.getCell(row, endCol);
      cell.border = {
        ...cell.border,
        right: this.OUTER_BORDER_STYLE,
      };
    }
  }

  private applyTypeFormatting(
    cell: ExcelJS.Cell,
    value: any,
    col: ExcelColumn
  ) {
    if (col.type === "date" && value) {
      cell.value = new Date(value);
      cell.numFmt = col.format || "mm/dd/yyyy";
    } else if (col.type === "number" && value !== null && value !== undefined) {
      cell.value = Number(value);
      cell.numFmt = col.format || "0";
    } else if (
      col.type === "currency" &&
      value !== null &&
      value !== undefined
    ) {
      cell.value = Number(value);
      cell.numFmt = col.format || "$#,##0.00";
    } else {
      cell.value = value;
      if (col.format) cell.numFmt = col.format;
    }
  }

  private getAlignmentForColumn(col: ExcelColumn): "left" | "center" | "right" {
    if (col.type === "number" || col.type === "currency" || col.key === "id") {
      return "center";
    }
    if (col.key === "status" || col.key === "role") {
      return "center";
    }
    return "left";
  }

  private configureSheet(
    worksheet: ExcelJS.Worksheet,
    config: ExcelSheet,
    dataEndRow: number
  ) {
    if (config.autoFilter) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: dataEndRow, column: config.columns.length },
      };
    }

    if (config.freezeRows) {
      worksheet.views = [{ state: "frozen", ySplit: 1 }];
    }

    worksheet.pageSetup = {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9, // A4
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    };

    if (this.options.protection) {
      worksheet.protect(this.options.protection.password || "", {
        selectLockedCells: this.options.protection.selectLockedCells ?? true,
        selectUnlockedCells:
          this.options.protection.selectUnlockedCells ?? true,
        formatCells: false,
        formatColumns: false,
        formatRows: false,
        insertColumns: false,
        insertRows: false,
        insertHyperlinks: false,
        deleteColumns: false,
        deleteRows: this.options.protection.deleteRows ?? false,
        sort: false,
        autoFilter: false,
        pivotTables: false,
      });
    }
  }

  public async export(): Promise<void> {
    const buffer = await this.workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, this.options.filename || "users_export.xlsx");
  }
}

// Usage example
export const handleExportToExcel = async (
  data: AllUsers | null,
  setIsExportingToExcel: (loading: boolean) => void,
  AppToast: (options: { type: string; message: string }) => void
) => {
  setIsExportingToExcel(true);

  try {
    const columns: ExcelColumn[] = [
      { header: "ID", key: "id", width: 8, type: "number" },
      { header: "Name", key: "name", width: 25, type: "text" },
      { header: "Email", key: "email", width: 35, type: "text" },
      { header: "Role", key: "role", width: 15, type: "text" },
      { header: "Status", key: "status", width: 12, type: "text" },
      {
        header: "Created Date",
        key: "createdAt",
        width: 18,
        type: "date",
        format: "mm/dd/yyyy",
      },
    ];

    const exporter = new ExcelExporter({
      filename: "user_data.xlsx",
      title: "User Management Report",
      author: "System Admin",
      useAlternateRows: true,
      protection: {
        password: "UserData2024",
        deleteRows: false,
        selectLockedCells: true,
        selectUnlockedCells: true,
      },
    });

    const sheetConfig: ExcelSheet = {
      name: "Users",
      data: data?.content ?? [],
      columns,
      autoFilter: true,
      freezeRows: 1,
      sortBy: [{ key: "id", order: "asc" }],
    };

    exporter.addSheet(sheetConfig);
    await exporter.export();

    AppToast({
      type: "success",
      message: "User data exported to Excel successfully!",
    });
  } catch (error: any) {
    AppToast({ type: "error", message: "Failed to export user data to Excel" });
    console.error("Excel export error:", error);
  } finally {
    setIsExportingToExcel(false);
  }
};
