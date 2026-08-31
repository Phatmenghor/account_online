package com.internal.feature.customer_image.component;

import com.internal.config.FileProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@RequiredArgsConstructor
@Slf4j
public class CustomerImageStorageComponent {

    private final FileProperties fileProperties;

    public String getUploadDir() {
        String dir = (fileProperties != null && fileProperties.getUpload() != null && fileProperties.getUpload().getDirectory() != null)
                ? fileProperties.getUpload().getDirectory()
                : "/app/customer-image";

        boolean isWindows = System.getProperty("os.name", "").toLowerCase().contains("win");
        if (isWindows || (!dir.startsWith("uploads") && !new java.io.File(dir).exists())) {
            return "uploads/customer-image";
        }
        return dir;
    }

    public String getJuniorUploadDir() {
        String dir = (fileProperties != null && fileProperties.getUpload() != null && fileProperties.getUpload().getJuniorDirectory() != null)
                ? fileProperties.getUpload().getJuniorDirectory()
                : "/app/junior";

        boolean isWindows = System.getProperty("os.name", "").toLowerCase().contains("win");
        if (isWindows || (!dir.startsWith("uploads") && !new java.io.File(dir).exists())) {
            return "uploads/junior";
        }
        return dir;
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
            String relativeSub = subFolder.replaceFirst("^junior/?", "");
            base = Paths.get(getJuniorUploadDir(), relativeSub);
        } else {
            base = Paths.get(getUploadDir(), subFolder != null ? subFolder : "");
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
        if (filename == null || filename.isBlank()) {
            return Optional.empty();
        }

        String lowerName = filename.toLowerCase();
        boolean isJunior = lowerName.contains("jnr") || (subFolder != null && subFolder.startsWith("junior"));
        String typeSub = lowerName.startsWith("selfie") ? "selfie"
                       : (lowerName.startsWith("ref_doc") || lowerName.contains("doc")) ? "document"
                       : "nid";

        java.util.List<Path> candidateDirs = new java.util.ArrayList<>();
        if (isJunior) {
            Path juniorBase = Paths.get(getJuniorUploadDir());
            candidateDirs.add(juniorBase.resolve(typeSub));
            candidateDirs.add(juniorBase);
            candidateDirs.add(Paths.get("uploads/junior", typeSub));
            candidateDirs.add(Paths.get("uploads/junior"));
        } else {
            Path customerBase = Paths.get(getUploadDir());
            candidateDirs.add(customerBase.resolve(typeSub));
            candidateDirs.add(customerBase);
            candidateDirs.add(Paths.get("uploads/customer-image", typeSub));
            candidateDirs.add(Paths.get("uploads"));
        }

        // 1. Direct file lookup in mapped subfolders
        for (Path dir : candidateDirs) {
            if (Files.exists(dir)) {
                Path file = dir.resolve(filename);
                if (Files.exists(file) && Files.isRegularFile(file)) {
                    return Optional.of(file);
                }
            }
        }

        // 2. Direct file lookup in weekly subfolders (e.g. 2026-07-W31)
        String weekFolder = getCurrentWeekFolder();
        for (Path dir : candidateDirs) {
            if (Files.exists(dir)) {
                Path weekFile = dir.resolve(weekFolder).resolve(filename);
                if (Files.exists(weekFile) && Files.isRegularFile(weekFile)) {
                    return Optional.of(weekFile);
                }
            }
        }

        // 3. Extension fallback (.jpg / .png / .pdf)
        String baseName = filename.contains(".") ? filename.substring(0, filename.lastIndexOf('.')) : filename;
        for (Path dir : candidateDirs) {
            if (Files.exists(dir)) {
                for (String ext : new String[]{".jpg", ".png", ".pdf", ".jpeg", ".webp"}) {
                    Path extFile = dir.resolve(baseName + ext);
                    if (Files.exists(extFile) && Files.isRegularFile(extFile)) {
                        return Optional.of(extFile);
                    }
                    Path weekExtFile = dir.resolve(weekFolder).resolve(baseName + ext);
                    if (Files.exists(weekExtFile) && Files.isRegularFile(weekExtFile)) {
                        return Optional.of(weekExtFile);
                    }
                }
            }
        }

        // 4. Prefix/Timestamped matching (e.g. searching for selfie_010876574 matches selfie_010876574_20260730132357083.jpg)
        for (Path dir : candidateDirs) {
            if (Files.exists(dir)) {
                Path latest = findLatestFileRecursive(dir, baseName);
                if (latest != null && Files.exists(latest)) {
                    return Optional.of(latest);
                }
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
        if (filePath == null) return;
        String lowerPath = filePath.toLowerCase();

        // Write raw uncompressed bytes directly for documents and PNG/WEBP files
        if (lowerPath.endsWith(".pdf") || lowerPath.endsWith(".docx") || lowerPath.endsWith(".doc") || lowerPath.endsWith(".png") || lowerPath.endsWith(".webp")) {
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(imageBytes);
            }
            return;
        }

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
