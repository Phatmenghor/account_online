package com.internal.integration.soap.t24;

import com.internal.config.CpbProperties;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.integration.ports.JuniorCoreBankingPort;
import com.internal.integration.soap.t24.payload.JuniorAccountXmlBuilder;
import com.internal.shared.exception.openaccount.T24ServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

/**
 * Dedicated SOAP adapter for Junior Account Opening T24 operations.
 * Communicates directly with JuniorAccountXmlBuilder for sector 6012 & SAVE.JUNIOR.SAVING.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorT24SoapAdapter implements JuniorCoreBankingPort {

    private final CpbProperties properties;
    private final RestTemplate restTemplate;
    private final JuniorAccountXmlBuilder juniorXmlBuilder;

    private static final MediaType TEXT_XML_UTF8 =
            new MediaType("text", "xml", StandardCharsets.UTF_8);

    @Override
    public Document createCustomer(JuniorCustomerRequest request) {
        log.info("Creating Junior customer in T24 for Legal ID: {}", request.getLegalId());
        String xmlRequest = juniorXmlBuilder.buildCustomerCreationXml(request);
        return executeT24Request(xmlRequest, "OAOCUSTOMERCREATION");
    }

    @Override
    public Document createAccount(JuniorCustomerRequest request, String cif, String currency) {
        log.info("Creating Junior {} account in T24 for CIF: {}", currency, cif);
        String xmlRequest = juniorXmlBuilder.buildAccountCreationXml(request, cif, currency);
        return executeT24Request(xmlRequest, "ACCREATIONOAO");
    }

    private Document executeT24Request(String xmlRequest, String operation) {
        long startTime = System.currentTimeMillis();
        String url = properties.getT24().getUrl() + "/TWS.CPBOAO/services";

        log.info("T24 Junior Request Started | op={} | url={} | payloadSize={} bytes",
                operation, url, xmlRequest != null ? xmlRequest.getBytes(StandardCharsets.UTF_8).length : 0);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(TEXT_XML_UTF8);
            headers.set("Accept", "text/xml; charset=UTF-8");
            headers.set("SOAPAction", operation);

            String traceId = org.slf4j.MDC.get("traceId");
            if (traceId != null && !traceId.isBlank()) {
                headers.set("X-Request-ID", traceId);
                headers.set("X-Trace-ID", traceId);
            }

            byte[] requestBytes = xmlRequest.getBytes(StandardCharsets.UTF_8);
            HttpEntity<byte[]> entity = new HttpEntity<>(requestBytes, headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, byte[].class);

            long duration = System.currentTimeMillis() - startTime;
            byte[] responseBytes = response.getBody();
            String responseBody = responseBytes != null ? new String(responseBytes, StandardCharsets.UTF_8) : null;

            log.info("[JuniorT24SoapAdapter] T24 Junior operation completed. operation={}, status={}, durationMs={}",
                    operation, response.getStatusCode(), duration);

            if (responseBody == null || responseBody.isEmpty()) {
                throw new T24ServiceException("T24 returned an empty response for Junior request");
            }

            Document doc = parseXmlResponse(responseBody);
            if (XmlParser.hasError(doc)) {
                String errorMessage = XmlParser.extractErrorMessage(doc);
                log.error("T24 Junior Business Error | op={} | message={}", operation, errorMessage);
                throw new T24ServiceException("T24 Junior Error: " + errorMessage);
            }

            return doc;

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("T24 Junior Request Failed | op={} | duration={} ms | message={}",
                    operation, duration, e.getMessage(), e);

            throw new T24ServiceException("T24 Junior call failed", e);
        }
    }

    private Document parseXmlResponse(String xmlString) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new ByteArrayInputStream(xmlString.getBytes(StandardCharsets.UTF_8)));
    }
}
