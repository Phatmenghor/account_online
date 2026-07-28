package com.internal.feature.junior_account.service.impl;

import com.internal.config.CpbProperties;
import com.internal.feature.junior_account.dto.response.CustomerInfoResponse;
import com.internal.feature.junior_account.service.CustomerInfoService;
import com.internal.shared.constant.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerInfoServiceImpl implements CustomerInfoService {

    private final CpbProperties cpbProperties;
    private final RestTemplate restTemplate;

    private static final MediaType TEXT_XML_UTF8 =
            new MediaType("text", "xml", StandardCharsets.UTF_8);

    @Override
    public CustomerInfoResponse getCustomerByCif(String cif) {
        log.info("Fetching customer info for CIF: {}", cif);

        String soapXml = buildSoapRequest(cif);
        String responseXml = callCustomerService(soapXml);
        return parseResponse(responseXml, cif);
    }

    // ── Build SOAP Request ─────────────────────────────────────────────────

    private String buildSoapRequest(String cif) {
        CpbProperties.T24 t24 = cpbProperties.getT24();
        String company = (cpbProperties.getDefaults() != null && cpbProperties.getDefaults().getBranchCode() != null)
                ? cpbProperties.getDefaults().getBranchCode()
                : AppConstants.DEFAULT_BRANCH_CODE;

        return """
            <?xml version="1.0" encoding="UTF-8"?>
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                              xmlns:los="http://temenos.com/LosUatWar2">
               <soapenv:Header/>
               <soapenv:Body>
                  <los:CustomerCreationSee>
                     <WebRequestCommon>
                        <company>%s</company>
                        <password>%s</password>
                        <userName>%s</userName>
                     </WebRequestCommon>
                     <CUSTOMERTULOSSEEType>
                        <transactionId>%s</transactionId>
                     </CUSTOMERTULOSSEEType>
                  </los:CustomerCreationSee>
               </soapenv:Body>
            </soapenv:Envelope>
            """.formatted(company, t24.getPassword(), t24.getUsername(), cif);
    }

    // ── Call SOAP Endpoint ─────────────────────────────────────────────

    private String callCustomerService(String soapXml) {
        String url = cpbProperties.getT24().getUrl() + "/CPB.LOS.TWS/services";

        log.info("Customer info SOAP call → {}", url);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(TEXT_XML_UTF8);
        headers.set("Accept", "text/xml; charset=UTF-8");
        headers.set("SOAPAction", "CustomerCreationSee");

        byte[] requestBytes = soapXml.getBytes(StandardCharsets.UTF_8);
        HttpEntity<byte[]> entity = new HttpEntity<>(requestBytes, headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, byte[].class);

        byte[] body = response.getBody();
        if (body == null) throw new RuntimeException("Returned empty response for customer info SOAP call");

        String xml = new String(body, StandardCharsets.UTF_8);
        log.info("Customer info response received ({} bytes)", xml.length());
        return xml;
    }

    // ── Parse SOAP Response XML ────────────────────────────────────────────

    private CustomerInfoResponse parseResponse(String xml, String cif) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

            // Extract CUSTOMERType element
            NodeList customerNodes = doc.getElementsByTagNameNS("*", "CUSTOMERType");
            if (customerNodes.getLength() == 0) {
                log.warn("No CUSTOMERType in response for CIF: {}", cif);
                return CustomerInfoResponse.builder().cif(cif).build();
            }

            Element customer = (Element) customerNodes.item(0);
            String resolvedCif = customer.getAttribute("id");
            if (resolvedCif == null || resolvedCif.isBlank()) resolvedCif = cif;

            return CustomerInfoResponse.builder()
                    .cif(resolvedCif)
                    .mnemonic(getText(doc, "MNEMONIC"))
                    .customerType(getText(doc, "CUSTOMERTYPE"))
                    .customerStatus(getText(doc, "CUSTOMERSTATUS"))

                    // Names
                    .shortNames(getTexts(doc, "SHORTNAME"))
                    .names(getTexts(doc, "NAME1"))
                    .khShortName(getText(doc, "CUKHSHRTNAME"))

                    // Address (Current)
                    .streets(getTexts(doc, "STREET"))
                    .province(getText(doc, "CUSTPROVINCE"))
                    .district(getText(doc, "CUSTDISTRICT"))
                    .commune(getText(doc, "CUSTCOMMUNE"))
                    .village(getText(doc, "CUSTVILLAGE"))

                    // Address (Place of Birth)
                    .pobProvince(getText(doc, "CUSTPROVINCEP"))
                    .pobDistrict(getText(doc, "CUSTDISTRICTP"))
                    .pobCommune(getText(doc, "CUSTCOMMUNEP"))
                    .pobVillage(getText(doc, "CUSTVILLAGEP"))

                    // Legal ID
                    .legalId(getText(doc, "LEGALID"))
                    .legalDocName(getText(doc, "LEGALDOCNAME"))
                    .legalHolderName(getText(doc, "LEGALHOLDERNAME"))
                    .legalIssAuth(getText(doc, "LEGALISSAUTH"))
                    .legalIssDate(getText(doc, "LEGALISSDATE"))
                    .legalIdDocName(getText(doc, "LEGALIDDOCNAME"))

                    // Personal & Organizational
                    .birthDate(getText(doc, "BIRTHINCORPDATE"))
                    .nationality(getText(doc, "NATIONALITY"))
                    .residence(getText(doc, "RESIDENCE"))
                    .language(getText(doc, "LANGUAGE"))
                    .sector(getText(doc, "SECTOR"))
                    .industry(getText(doc, "INDUSTRY"))
                    .target(getText(doc, "TARGET"))
                    .customerRating(getText(doc, "CUSTOMERRATING"))
                    .custOwnership(getText(doc, "CUSTOWNERSHIP"))

                    // Staff & Referral
                    .accountOfficer(getText(doc, "ACCOUNTOFFICER"))
                    .relManager(getText(doc, "RELMANAGER"))
                    .referralBy(getText(doc, "REFERRALBY"))

                    // Contact
                    .phones(getTexts(doc, "PHONE1"))

                    // Banking & Compliance
                    .companyBook(getText(doc, "COMPANYBOOK"))
                    .coCode(getText(doc, "COCODE"))
                    .deptCode(getText(doc, "DEPTCODE"))
                    .internetBankingService(getText(doc, "INTERNETBANKINGSERVICE"))
                    .mobileBankingService(getText(doc, "MOBILEBANKINGSERVICE"))
                    .amlCheck(getText(doc, "AMLCHECK"))
                    .amlResult(getText(doc, "AMLRESULT"))
                    .lcpbCusAsset(getText(doc, "LCPBCUSASSET"))

                    // Audit Info
                    .currNo(getText(doc, "CURRNO"))
                    .inputter(getText(doc, "INPUTTER"))
                    .dateTime(getText(doc, "DATETIME"))
                    .authoriser(getText(doc, "AUTHORISER"))
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse customer info response for CIF {}: {}", cif, e.getMessage(), e);
            throw new RuntimeException("Failed to parse customer info response", e);
        }
    }

    // ── XML Helper Methods ─────────────────────────────────────────────────

    private String getText(Document doc, String tag) {
        NodeList nodes = doc.getElementsByTagNameNS("*", tag);
        if (nodes.getLength() > 0) {
            String val = nodes.item(0).getTextContent();
            return (val != null && !val.isBlank()) ? val.trim() : null;
        }
        return null;
    }

    private List<String> getTexts(Document doc, String tag) {
        NodeList nodes = doc.getElementsByTagNameNS("*", tag);
        List<String> results = new ArrayList<>();
        for (int i = 0; i < nodes.getLength(); i++) {
            String val = nodes.item(i).getTextContent();
            if (val != null && !val.isBlank()) results.add(val.trim());
        }
        return results.isEmpty() ? null : results;
    }
}
