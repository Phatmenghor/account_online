package com.internal.config.template;

import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.http.io.SocketConfig;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.util.Timeout;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        try {
            SSLContext sslContext = SSLContextBuilder.create()
                    .loadTrustMaterial(null, (chain, authType) -> true)
                    .build();

            var connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                    .setSSLSocketFactory(SSLConnectionSocketFactoryBuilder.create()
                            .setSslContext(sslContext)
                            .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                            .build())
                    .setDefaultSocketConfig(SocketConfig.custom()
                            .setSoTimeout(Timeout.ofMinutes(5))
                            .build())
                    .build();

            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectTimeout(Timeout.ofMinutes(5))
                    .setConnectionRequestTimeout(Timeout.ofMinutes(5))
                    .build();

            CloseableHttpClient httpClient = HttpClients.custom()
                    .setConnectionManager(connectionManager)
                    .setDefaultRequestConfig(requestConfig)
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
            SSLContext sslContext = SSLContextBuilder.create()
                    .loadTrustMaterial(null, (chain, authType) -> true)
                    .build();

            var connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                    .setSSLSocketFactory(SSLConnectionSocketFactoryBuilder.create()
                            .setSslContext(sslContext)
                            .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                            .build())
                    .setDefaultSocketConfig(SocketConfig.custom()
                            .setSoTimeout(Timeout.ofSeconds(30))
                            .build())
                    .build();

            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectTimeout(Timeout.ofSeconds(30))
                    .setConnectionRequestTimeout(Timeout.ofSeconds(30))
                    .build();

            CloseableHttpClient httpClient = HttpClients.custom()
                    .setConnectionManager(connectionManager)
                    .setDefaultRequestConfig(requestConfig)
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
