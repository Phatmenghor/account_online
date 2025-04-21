package com.cambodiapostbank.accountonline.cpbank.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;


public class DateFormatter {

    private static final SimpleDateFormat INPUT_FORMAT = new SimpleDateFormat("dd/MM/yyyy");
    private static final SimpleDateFormat OUTPUT_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    public static String formatDate(String inputDate) {
        if (inputDate == null || inputDate.trim().isEmpty()) {
            return null;
        }

        try {
            Date date = INPUT_FORMAT.parse(inputDate);
            return OUTPUT_FORMAT.format(date);
        } catch (ParseException e) {
            // Log or handle the parsing error
            System.err.println("Invalid date format: " + inputDate);
            return null;
        }
    }
}
