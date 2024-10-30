package com.cambodiapostbank.accountonline.cpbank.utils.http;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class HttpClient {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String CONTENT_TYPE_HEADER = "Content-Type";
    private static final String ACCEPT_HEADER = "Accept";
    private static final String CONNECTION_HEADER = "Connection";
    private static final String BASIC_AUTH_PREFIX = "Basic ";

    public static String getData(String url, String username, String password) throws Exception {
        URL apiUrl = new URL(url);

        TrustCert trustCert = new TrustCert();
        trustCert.trustAllCertificate();

        HttpURLConnection connection = null;
        BufferedReader reader = null;

        try {
            connection = (HttpURLConnection) apiUrl.openConnection();
            connection.setRequestMethod("GET");
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setUseCaches(false);

            String credentials = username + ":" + password;
            String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

            connection.setRequestProperty(AUTHORIZATION_HEADER, BASIC_AUTH_PREFIX + encodedCredentials);
            connection.setRequestProperty(CONTENT_TYPE_HEADER, "application/json");
            connection.setRequestProperty(ACCEPT_HEADER, "application/json");
            connection.setRequestProperty(CONNECTION_HEADER, "Keep-Alive");

            reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder response = new StringBuilder();

            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }

            return response.toString();
        } finally {
            if (reader != null) {
                reader.close();
            }
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    public static String postData(String url, String postJsonData, String username, String password) throws Exception {
        URL apiUrl = new URL(url);

        TrustCert trustCert = new TrustCert();
        trustCert.trustAllCertificate();

        HttpURLConnection connection = null;
        OutputStream outputStream = null;
        BufferedReader reader = null;

        try {
            connection = (HttpURLConnection) apiUrl.openConnection();
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setUseCaches(false);

            String credentials = username + ":" + password;
            String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

            byte[] postDataBytes = postJsonData.getBytes(StandardCharsets.UTF_8);

            connection.setRequestProperty(AUTHORIZATION_HEADER, BASIC_AUTH_PREFIX + encodedCredentials);
            connection.setRequestProperty(CONTENT_TYPE_HEADER, "application/json; charset=UTF-8");
            connection.setRequestProperty(ACCEPT_HEADER, "application/json");
            connection.setRequestProperty(CONNECTION_HEADER, "Keep-Alive");
            connection.setRequestProperty("Content-Length", String.valueOf(postDataBytes.length));

            outputStream = connection.getOutputStream();
            outputStream.write(postDataBytes);

            reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder response = new StringBuilder();

            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }

            return response.toString();
        } finally {
            if (reader != null) {
                reader.close();
            }
            if (outputStream != null) {
                outputStream.close();
            }
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}