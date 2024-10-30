package com.cambodiapostbank.accountonline.cpbank.utils.http;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.Base64;

@Component
public class CpbHttpClient {
    private final String authorization;
    private final String baseUrl;

    public CpbHttpClient(
            @Value("${t24api.username}") String userName,
            @Value("${t24api.password}") String password,
            @Value("${t24api.base_url}") String baseUrl

    ) throws NoSuchAlgorithmException, KeyManagementException {
        HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(null, new X509TrustManager[]{new X509TrustManager(){
            public void checkClientTrusted(X509Certificate[] chain, String authType) {}
            public void checkServerTrusted(X509Certificate[] chain, String authType) {}
            public X509Certificate[] getAcceptedIssuers() {
                return new X509Certificate[0];
            }}}, new SecureRandom());
        HttpsURLConnection.setDefaultSSLSocketFactory(context.getSocketFactory());
        this.baseUrl = baseUrl;
        this.authorization = String.format("Basic %s", Base64.getEncoder().encodeToString((userName+":"+password).getBytes()));
    }

    public HttpURLConnection post(String uri, String json) throws IOException {
        URL url = new URL(String.format("%s/%s", baseUrl, uri));
        HttpURLConnection http = (HttpURLConnection) url.openConnection();
        http.setDoOutput(true);
        http.setDoInput(true);
        http.setUseCaches(false);
        http.setRequestMethod("POST");
        http.setRequestProperty("Authorization", authorization);
        http.setRequestProperty("Content-Type", "application/json");
        http.setRequestProperty("Accept", "application/json");
        http.setRequestProperty("Content-Length", String.valueOf(json.getBytes(StandardCharsets.UTF_8).length));
        OutputStreamWriter outputStreamWriter = new OutputStreamWriter(http.getOutputStream());
        outputStreamWriter.write(json);
        outputStreamWriter.flush();
        return http;
    }

    public HttpURLConnection get(String uri) throws IOException {
        URL url = new URL(String.format("%s/%s", baseUrl, uri));
        HttpURLConnection http = (HttpURLConnection) url.openConnection();
        http.setRequestMethod("GET");
        http.setRequestProperty("Authorization", authorization);
        http.setRequestProperty("Content-Type", "application/json");
        http.setRequestProperty("Accept", "application/json");
        return http;
    }
}
