import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { SuccessAccountOnlineExcelModel } from "@/models/open-acc-success/success-account-response.model";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE ?? "";
const CUSTOMER_IMAGES_PATH = "/api/customer-images";

const HEADERS = ["#", "Legal ID", "CIF", "KHR Account", "USD Account", "Mnemonic", "Branch NameKh", "NID Image", "Selfie Image", "Created At"];
const COLUMN_WIDTHS = [5, 18, 18, 22, 22, 18, 30, 20, 20, 20];
const IMAGE_ROW_HEIGHT = 90;

async function fetchImageAsBase64(imageName: string): Promise<{ base64: string; extension: string } | null> {
    try {
        const url = `${IMAGE_BASE_URL}${CUSTOMER_IMAGES_PATH}/${imageName}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        const extension = imageName.split(".").pop()?.toLowerCase() || "jpg";
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(",")[1];
                resolve({ base64, extension });
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

function applyThinBorder(cell: ExcelJS.Cell) {
    cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
    };
}

function buildTitleRow(worksheet: ExcelJS.Worksheet, colCount: number) {
    worksheet.mergeCells(1, 1, 1, colCount);
    const cell = worksheet.getCell("A1");
    cell.value = "Success Account Online Report";
    cell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
}

function buildSummaryRow(worksheet: ExcelJS.Worksheet, colCount: number, totalRecords: number, fromDate: string, toDate: string) {
    worksheet.mergeCells(2, 1, 2, colCount);
    const cell = worksheet.getCell("A2");
    cell.value = `Total Records: ${totalRecords}  |  From: ${fromDate}  To: ${toDate}`;
    cell.font = { size: 11, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } };
}

function buildHeaderRow(worksheet: ExcelJS.Worksheet) {
    const headerRow = worksheet.getRow(4);
    HEADERS.forEach((text, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = text;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF007ACC" } };
        applyThinBorder(cell);
        worksheet.getColumn(idx + 1).width = COLUMN_WIDTHS[idx];
    });
}

async function addDataRow(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    item: SuccessAccountOnlineExcelModel,
    rowIndex: number,
) {
    const excelRowNumber = rowIndex + 5;
    const row = worksheet.addRow([
        rowIndex + 1,
        item.legalId || "---",
        item.cif || "---",
        item.khrAccount || "---",
        item.usdAccount || "---",
        item.mnemonic || "---",
        item.branchNameKh || "---",
        "",
        "",
        item.createdAt || "---",
    ]);

    row.height = IMAGE_ROW_HEIGHT;
    row.eachCell((cell) => {
        cell.fill = {
            type: "pattern", pattern: "solid",
            fgColor: { argb: rowIndex % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" },
        };
        applyThinBorder(cell);
        cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    if (item.nidImageName) {
        const img = await fetchImageAsBase64(item.nidImageName);
        if (img) {
            const id = workbook.addImage({ base64: img.base64, extension: img.extension as "jpeg" | "png" | "gif" });
            worksheet.addImage(id, { tl: { col: 7, row: excelRowNumber - 1 } as any, ext: { width: 120, height: 80 }, editAs: "oneCell" } as any);
        } else {
            worksheet.getCell(excelRowNumber, 8).value = "Image N/A";
        }
    }

    if (item.selfieImageName) {
        const img = await fetchImageAsBase64(item.selfieImageName);
        if (img) {
            const id = workbook.addImage({ base64: img.base64, extension: img.extension as "jpeg" | "png" | "gif" });
            worksheet.addImage(id, { tl: { col: 8, row: excelRowNumber - 1 } as any, ext: { width: 120, height: 80 }, editAs: "oneCell" } as any);
        } else {
            worksheet.getCell(excelRowNumber, 9).value = "Image N/A";
        }
    }
}

function formatDateColumn(worksheet: ExcelJS.Worksheet, colIndex: number) {
    worksheet.getColumn(colIndex).eachCell((cell, rowNumber) => {
        if (rowNumber > 4 && cell.value && cell.value !== "---") {
            try {
                const d = new Date(cell.value as string);
                if (!isNaN(d.getTime())) {
                    cell.value = d;
                    cell.numFmt = "dd-mm-yyyy hh:mm";
                }
            } catch { /* keep as string */ }
        }
    });
}

export interface ExportSuccessAccountExcelOptions {
    rows: SuccessAccountOnlineExcelModel[];
    totalRecords: number;
    fromDate: string;
    toDate: string;
}

export async function exportSuccessAccountToExcel({
    rows,
    totalRecords,
    fromDate,
    toDate,
}: ExportSuccessAccountExcelOptions): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Success Accounts");

    buildTitleRow(worksheet, HEADERS.length);
    buildSummaryRow(worksheet, HEADERS.length, totalRecords, fromDate, toDate);
    buildHeaderRow(worksheet);

    for (let i = 0; i < rows.length; i++) {
        await addDataRow(workbook, worksheet, rows[i], i);
    }

    formatDateColumn(worksheet, 10);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `success_accounts_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
}
