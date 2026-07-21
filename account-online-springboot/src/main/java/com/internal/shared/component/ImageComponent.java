package com.internal.shared.component;

import org.springframework.stereotype.Component;

@Component
public class ImageComponent {

    /**
     * Checks if the filename represents a standard image extension.
     */
    public boolean isImageFile(String filename) {
        if (filename == null) return false;
        String lowercase = filename.toLowerCase();
        return lowercase.endsWith(".jpg") || lowercase.endsWith(".jpeg")
                || lowercase.endsWith(".png") || lowercase.endsWith(".gif");
    }

    /**
     * Extracts the extension of the file including the dot separator.
     */
    public String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
