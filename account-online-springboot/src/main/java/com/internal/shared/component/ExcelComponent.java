package com.internal.shared.component;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
@Slf4j
public class ExcelComponent {

    /**
     * Creates an Excel workbook in-memory and returns its byte array.
     */
    public byte[] generateExcel(String sheetName, List<String> headers, List<List<Object>> rows) {
        log.info("Generating Excel sheet: {}", sheetName);
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(sheetName);

            // Create header row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
            }

            // Create data rows
            for (int r = 0; r < rows.size(); r++) {
                Row row = sheet.createRow(r + 1);
                List<Object> rowData = rows.get(r);
                for (int c = 0; c < rowData.size(); c++) {
                    Cell cell = row.createCell(c);
                    Object val = rowData.get(c);
                    if (val != null) {
                        if (val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                        } else if (val instanceof Boolean) {
                            cell.setCellValue((Boolean) val);
                        } else {
                            cell.setCellValue(val.toString());
                        }
                    }
                }
            }

            workbook.write(bos);
            return bos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Excel sheet: {}", sheetName, e);
            throw new RuntimeException("Excel generation failed", e);
        }
    }
}
