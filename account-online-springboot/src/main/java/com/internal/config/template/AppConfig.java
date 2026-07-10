package com.internal.config.template;

import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.ssl.SSLContextBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.client.config.RequestConfig;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        try {
            // 5 minutes (300s) timeout for slow operations: Account Opening, T24, CAMDX
            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectTimeout(300000)
                    .setSocketTimeout(300000)
                    .setConnectionRequestTimeout(300000)
                    .build();

            // Trust all certificates for internal servers that use self-signed certs
            SSLConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(
                    SSLContextBuilder.create().loadTrustMaterial(null, (chain, authType) -> true).build(),
                    NoopHostnameVerifier.INSTANCE);

            CloseableHttpClient httpClient = HttpClientBuilder.create()
                    .setDefaultRequestConfig(requestConfig)
                    .setSSLSocketFactory(sslSocketFactory)
                    .build();

            ClientHttpRequestFactory factory = new BufferingClientHttpRequestFactory(
                    new HttpComponentsClientHttpRequestFactory(httpClient));

            RestTemplate restTemplate = new RestTemplate();
            restTemplate.setRequestFactory(factory);
            return restTemplate;

        } catch (Exception e) {
            throw new RuntimeException("Failed to configure RestTemplate SSL", e);
        }
    }

    @Bean(name = "mobileBankingRestTemplate")
    public RestTemplate mobileBankingRestTemplate() {
        try {
            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectTimeout(30000)
                    .setSocketTimeout(30000)
                    .setConnectionRequestTimeout(30000)
                    .build();

            SSLConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(
                    SSLContextBuilder.create().loadTrustMaterial(null, (chain, authType) -> true).build(),
                    NoopHostnameVerifier.INSTANCE);

            CloseableHttpClient httpClient = HttpClientBuilder.create()
                    .setDefaultRequestConfig(requestConfig)
                    .setSSLSocketFactory(sslSocketFactory)
                    .build();

            ClientHttpRequestFactory factory = new BufferingClientHttpRequestFactory(
                    new HttpComponentsClientHttpRequestFactory(httpClient));

            RestTemplate restTemplate = new RestTemplate();
            restTemplate.setRequestFactory(factory);
            return restTemplate;

        } catch (Exception e) {
            throw new RuntimeException("Failed to configure mobileBankingRestTemplate SSL", e);
        }
    }
}
