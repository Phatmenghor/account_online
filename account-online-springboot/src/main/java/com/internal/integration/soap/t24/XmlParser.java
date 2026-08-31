package com.internal.integration.soap.t24;

import lombok.extern.slf4j.Slf4j;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

@Slf4j
public class XmlParser {

    private XmlParser() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Extract CIF from T24 customer creation response
     * Validates that MNEMONIC is present to ensure customer was created cleanly.
     */
    public static String extractCif(Document document) {
        try {
            log.info("[XmlParser] Beginning CIF extraction from T24 customer creation XML...");

            if (hasError(document)) {
                String errMsg = extractErrorMessage(document);
                log.warn("[XmlParser] Response contains T24 error: {}", errMsg);
                return null;
            }

            // Check if MNEMONIC is present — valid T24 customer creation MUST return a MNEMONIC
            String mnemonic = extractMnemonic(document);
            if (mnemonic == null || mnemonic.isBlank()) {
                String errMsg = extractErrorMessage(document);
                log.warn("[XmlParser] T24 customer creation incomplete (missing MNEMONIC). Response error: {}", errMsg);
                return null;
            }

            // Priority 1: Try to find CUSTOMERType element attribute 'id'
            NodeList customerNodes = document.getElementsByTagName("CUSTOMERType");
            if (customerNodes.getLength() > 0) {
                Element customerElement = (Element) customerNodes.item(0);
                String cif = customerElement.getAttribute("id");
                if (cif != null && !cif.trim().isEmpty()) {
                    log.info("[XmlParser] Extracted CIF from <CUSTOMERType id=\"...\">: {}", cif.trim());
                    return cif.trim();
                }
            }

            // Priority 2: Check <transactionId> in <Status> tag if customer creation succeeded
            NodeList transIdNodes = document.getElementsByTagName("transactionId");
            if (transIdNodes.getLength() > 0) {
                String transId = transIdNodes.item(0).getTextContent();
                if (transId != null && !transId.trim().isEmpty() && isPureNumericAccount(transId.trim())) {
                    log.info("[XmlParser] Extracted CIF from <transactionId> element: {}", transId.trim());
                    return transId.trim();
                }
            }

            log.warn("[XmlParser] No CIF found in XML response");
            return null;

        } catch (Exception e) {
            log.error("[XmlParser] Failed to extract CIF from XML: {}", e.getMessage(), e);
            return null;
        }
    }

    public static String extractMnemonic(Document document) {
        try {
            log.info("[XmlParser] Beginning MNEMONIC extraction from T24 XML...");
            // Try with namespace first
            NodeList mnemonicNodes = document.getElementsByTagNameNS(
                    "http://temenos.com/CUSTOMER",
                    "MNEMONIC");

            if (mnemonicNodes != null && mnemonicNodes.getLength() > 0) {
                String mnemonic = mnemonicNodes.item(0).getTextContent();
                if (mnemonic != null && !mnemonic.trim().isEmpty()) {
                    log.info("[XmlParser] Extracted MNEMONIC (with namespace): {}", mnemonic.trim());
                    return mnemonic.trim();
                }
            }

            // Try without namespace as fallback
            mnemonicNodes = document.getElementsByTagName("MNEMONIC");
            if (mnemonicNodes != null && mnemonicNodes.getLength() > 0) {
                String mnemonic = mnemonicNodes.item(0).getTextContent();
                if (mnemonic != null && !mnemonic.trim().isEmpty()) {
                    log.info("[XmlParser] Extracted MNEMONIC (without namespace): {}", mnemonic.trim());
                    return mnemonic.trim();
                }
            }

            log.warn("[XmlParser] No MNEMONIC found in response");
            return null;

        } catch (Exception e) {
            log.error("[XmlParser] Failed to extract MNEMONIC: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract account number from T24 account creation response.
     * Prioritizes pure numeric 8-18 digit account numbers (e.g. 000670814) from <LINKEDAPPLID> / <ACCOUNTNUMBER>.
     */
    public static String extractAccountNumber(Document document) {
        try {
            log.info("[XmlParser] Beginning T24 account number extraction from response document...");

            if (hasError(document)) {
                String errMsg = extractErrorMessage(document);
                log.warn("[XmlParser] Response contains T24 error: {}", errMsg);
                return null;
            }

            // Step 1: Scan for pure numeric account number in dedicated tags first (LINKEDAPPLID, ACCOUNTNUMBER, etc.)
            String[] numericTags = {
                "LINKEDAPPLID", "LINKED_APPL_ID", "ACCOUNTNUMBER", "ACCOUNT.NUMBER", "ACCOUNT_NUMBER", 
                "ACCOUNT.ID", "ACCOUNT_ID", "accountNumber", "accountNo", "AccountNo"
            };

            for (String tag : numericTags) {
                NodeList nodes = document.getElementsByTagName(tag);
                if (nodes.getLength() == 0) {
                    nodes = document.getElementsByTagNameNS("*", tag);
                }
                for (int i = 0; i < nodes.getLength(); i++) {
                    String val = nodes.item(i).getTextContent();
                    if (val != null && isPureNumericAccount(val.trim())) {
                        log.info("[XmlParser] Pure numeric account number extracted from element <{}>: {}", tag, val.trim());
                        return val.trim();
                    }
                }
            }

            // Step 2: Check Status element where application == ACCOUNT
            NodeList statusNodes = document.getElementsByTagName("Status");
            for (int i = 0; i < statusNodes.getLength(); i++) {
                Element statusElement = (Element) statusNodes.item(i);
                NodeList appNodes = statusElement.getElementsByTagName("application");
                if (appNodes.getLength() > 0 && "ACCOUNT".equalsIgnoreCase(appNodes.item(0).getTextContent())) {
                    NodeList transIdNodes = statusElement.getElementsByTagName("transactionId");
                    if (transIdNodes.getLength() > 0) {
                        String accNo = transIdNodes.item(0).getTextContent();
                        if (accNo != null && isPureNumericAccount(accNo.trim())) {
                            log.info("[XmlParser] Extracted account number from Status/ACCOUNT application: {}", accNo.trim());
                            return accNo.trim();
                        }
                    }
                }
            }

            // Step 3: Any non-numeric tag content fallback (e.g. LINKEDAPPLID, ACCOUNTNUMBER without strict numeric match)
            for (String tag : numericTags) {
                NodeList nodes = document.getElementsByTagName(tag);
                if (nodes.getLength() == 0) {
                    nodes = document.getElementsByTagNameNS("*", tag);
                }
                for (int i = 0; i < nodes.getLength(); i++) {
                    String val = nodes.item(i).getTextContent();
                    if (val != null && !val.trim().isEmpty()) {
                        log.info("[XmlParser] Account number extracted from element <{}>: {}", tag, val.trim());
                        return val.trim();
                    }
                }
            }

            // Step 4: Arrangement ID fallback (ARRANGEMENT, transactionId, etc.)
            String[] arrangementTags = {"ARRANGEMENTACCOUNTID", "ArrangementAccountId", "ARRANGEMENTACCOUNT", "ARRANGEMENT"};
            for (String tag : arrangementTags) {
                NodeList nodes = document.getElementsByTagName(tag);
                if (nodes.getLength() == 0) {
                    nodes = document.getElementsByTagNameNS("*", tag);
                }
                for (int i = 0; i < nodes.getLength(); i++) {
                    String val = nodes.item(i).getTextContent();
                    if (val != null && !val.trim().isEmpty()) {
                        log.info("[XmlParser] Arrangement ID extracted from element <{}>: {}", tag, val.trim());
                        return val.trim();
                    }
                }
            }

            // Step 5: Direct transactionId fallback
            NodeList transIdNodes = document.getElementsByTagName("transactionId");
            if (transIdNodes.getLength() > 0) {
                String val = transIdNodes.item(0).getTextContent();
                if (val != null && !val.trim().isEmpty()) {
                    log.info("[XmlParser] Account number extracted from transactionId: {}", val.trim());
                    return val.trim();
                }
            }

            log.warn("[XmlParser] No account number found in XML response document");
            return null;

        } catch (Exception e) {
            log.error("[XmlParser] Failed to extract account number from XML: {}", e.getMessage(), e);
            return null;
        }
    }

    private static boolean isPureNumericAccount(String val) {
        if (val == null) return false;
        String trimmed = val.trim();
        return trimmed.matches("^\\d{8,18}$");
    }

    /**
     * Check if XML response contains error
     */
    public static boolean hasError(Document document) {
        try {
            // Check for explicit <successIndicator>T24Error</successIndicator>
            NodeList successNodes = document.getElementsByTagName("successIndicator");
            if (successNodes.getLength() > 0) {
                String indicator = successNodes.item(0).getTextContent();
                if ("T24Error".equalsIgnoreCase(indicator)) {
                    return true;
                }
            }

            // Check for <messages> tag (e.g. <messages>CUSTOMER:1:1=MISSING CUSTOMER - RECORD</messages>)
            NodeList messagesNodes = document.getElementsByTagName("messages");
            if (messagesNodes.getLength() > 0) {
                return true;
            }

            NodeList errorNodes = document.getElementsByTagName("error");
            if (errorNodes.getLength() > 0) {
                return true;
            }

            NodeList faultNodes = document.getElementsByTagName("faultstring");
            return faultNodes.getLength() > 0;
        } catch (Exception e) {
            log.error("[XmlParser] Error checking for XML errors: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract error message from T24 XML response
     */
    public static String extractErrorMessage(Document document) {
        try {
            // Check for <messages> tag (common in T24 responses)
            NodeList messageNodes = document.getElementsByTagName("messages");
            if (messageNodes.getLength() > 0) {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < messageNodes.getLength(); i++) {
                    if (i > 0) sb.append("; ");
                    sb.append(messageNodes.item(i).getTextContent());
                }
                if (!sb.toString().isBlank()) {
                    return sb.toString();
                }
            }

            // Check field validation error messages inside CUSTOMERType
            NodeList customerNodes = document.getElementsByTagName("CUSTOMERType");
            if (customerNodes.getLength() > 0) {
                Element customerElement = (Element) customerNodes.item(0);
                NodeList allChildNodes = customerElement.getElementsByTagName("*");
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < allChildNodes.getLength(); i++) {
                    Element el = (Element) allChildNodes.item(i);
                    if (el.getChildNodes().getLength() == 1 && el.getFirstChild().getNodeType() == org.w3c.dom.Node.TEXT_NODE) {
                        String text = el.getTextContent();
                        if (text != null && (text.contains("MISSING") || text.contains("CANNOT") || text.contains("INVALID") || text.contains("ERROR") || text.contains("NOT ALLOWED"))) {
                            if (sb.length() > 0) sb.append("; ");
                            String tag = el.getLocalName() != null ? el.getLocalName() : el.getTagName();
                            sb.append(tag).append(": ").append(text.trim());
                        }
                    }
                }
                if (sb.length() > 0) {
                    return sb.toString();
                }
            }

            NodeList textNodes = document.getElementsByTagName("text");
            if (textNodes.getLength() > 0) {
                return textNodes.item(0).getTextContent();
            }
            NodeList errorNodes = document.getElementsByTagName("error");
            if (errorNodes.getLength() > 0) {
                return errorNodes.item(0).getTextContent();
            }
            NodeList faultNodes = document.getElementsByTagName("faultstring");
            if (faultNodes.getLength() > 0) {
                return faultNodes.item(0).getTextContent();
            }
            return "Unknown T24 error";
        } catch (Exception e) {
            log.error("[XmlParser] Failed to extract error message: {}", e.getMessage());
            return "Error extracting message";
        }
    }
}
