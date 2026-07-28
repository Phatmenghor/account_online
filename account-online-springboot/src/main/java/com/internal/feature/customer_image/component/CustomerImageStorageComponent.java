package com.internal.feature.customer_image.component;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.Base64;
import java.util.Comparator;
import java.util.Iterator;
import java.util.Optional;
import java.util.stream.Stream;

@Component
@Slf4j
public class CustomerImageStorageComponent {

    @Value("${file.upload.directory:/app/customer-image}")
    private String uploadDir;

    public String getUploadDir() {
        return uploadDir;
    }

    public String getCurrentWeekFolder() {
        LocalDate today = LocalDate.now();
        int isoWeek = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        String monthPart = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        return String.format("%s-W%02d", monthPart, isoWeek);
    }

    public Path resolveWeekFolder(String subFolder) {
        Path base;
        if (subFolder != null && subFolder.startsWith("junior")) {
            Path parent = Paths.get(uploadDir).getParent();
            base = (parent != null) ? parent.resolve(subFolder) : Paths.get(uploadDir, subFolder);
        } else {
            base = Paths.get(uploadDir, subFolder);
        }
        Path dir = base.resolve(getCurrentWeekFolder());
        dir.toFile().mkdirs();
        return dir;
    }

    public Path findLatestFileRecursive(Path baseDir, String prefix) {
        if (!Files.exists(baseDir)) {
            return null;
        }
        try (Stream<Path> walk = Files.walk(baseDir, 2)) {
            return walk
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().startsWith(prefix))
                    .max(Comparator.comparingLong(p -> p.toFile().lastModified()))
                    .orElse(null);
        } catch (IOException e) {
            log.warn("Could not scan directory {} for prefix {}: {}", baseDir, prefix, e.getMessage());
            return null;
        }
    }

    public Optional<Path> findFileByName(String subFolder, String filename) {
        Path subDir;
        if (subFolder != null && subFolder.startsWith("junior")) {
            Path parent = Paths.get(uploadDir).getParent();
            subDir = (parent != null) ? parent.resolve(subFolder) : Paths.get(uploadDir, subFolder);
        } else {
            subDir = Paths.get(uploadDir, subFolder);
        }

        if (Files.exists(subDir)) {
            try (Stream<Path> walk = Files.walk(subDir, 4)) {
                Optional<Path> found = walk
                        .filter(Files::isRegularFile)
                        .filter(p -> p.getFileName().toString().equalsIgnoreCase(filename))
                        .findFirst();
                if (found.isPresent()) {
                    return found;
                }
            } catch (IOException e) {
                log.warn("Could not search for file {} in {}: {}", filename, subDir, e.getMessage());
            }
        }

        Path mainDir = Paths.get(uploadDir);
        if (Files.exists(mainDir)) {
            try (Stream<Path> walk = Files.walk(mainDir, 4)) {
                return walk
                        .filter(Files::isRegularFile)
                        .filter(p -> p.getFileName().toString().equalsIgnoreCase(filename))
                        .findFirst();
            } catch (IOException e) {
                log.warn("Could not search for file {} in root {}: {}", filename, mainDir, e.getMessage());
            }
        }

        return Optional.empty();
    }

    public String extractLegalIdFromFilename(String filename) {
        try {
            String withoutExt = filename.contains(".")
                    ? filename.substring(0, filename.lastIndexOf('.'))
                    : filename;
            String[] parts = withoutExt.split("_", 3);
            if (parts.length >= 2) {
                return parts[1];
            }
        } catch (Exception e) {
            log.warn("Could not extract legalId from filename: {}", filename);
        }
        return null;
    }

    public void saveBase64ToFile(String base64, String filePath) throws Exception {
        if (base64 == null || base64.isEmpty()) return;

        if (base64.contains(",")) {
            int idx = base64.indexOf("base64,");
            base64 = (idx != -1)
                    ? base64.substring(idx + 7)
                    : base64.substring(base64.lastIndexOf(",") + 1);
        }

        base64 = base64.replaceAll("[^A-Za-z0-9+/=]", "");
        byte[] decoded = Base64.getDecoder().decode(base64);
        saveCompressedImage(decoded, filePath);
    }

    public void saveCompressedImage(byte[] imageBytes, String filePath) throws Exception {
        ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
        BufferedImage originalImage = ImageIO.read(bais);
        if (originalImage == null) {
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(imageBytes);
            }
            return;
        }

        BufferedImage rgbImage = new BufferedImage(
                originalImage.getWidth(),
                originalImage.getHeight(),
                BufferedImage.TYPE_INT_RGB);

        Graphics2D g = rgbImage.createGraphics();
        g.drawImage(originalImage, 0, 0, Color.WHITE, null);
        g.dispose();

        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(imageBytes);
            }
            return;
        }

        ImageWriter writer = writers.next();
        File file = new File(filePath);
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(file)) {
            writer.setOutput(ios);

            ImageWriteParam param = writer.getDefaultWriteParam();
            if (param.canWriteCompressed()) {
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(0.5f);
            }

            writer.write(null, new IIOImage(rgbImage, null, null), param);
        } finally {
            writer.dispose();
        }
    }
}
