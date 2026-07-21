package com.internal.shared.component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class SoapComponent {

    private final RestTemplate restTemplate;

    /**
     * Sends a raw XML SOAP payload via POST to the specified URL.
     *
     * @param url     Target SOAP gateway endpoint
     * @param soapXml SOAP envelope XML string
     * @return Response string
     */
    public String sendSoapRequest(String url, String soapXml) {
        log.info("Sending SOAP request to URL: {}", url);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("application/soap+xml"));
        HttpEntity<String> entity = new HttpEntity<>(soapXml, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        return response.getBody();
    }
}
