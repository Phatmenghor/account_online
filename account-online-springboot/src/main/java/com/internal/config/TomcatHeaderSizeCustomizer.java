package com.internal.config;

import org.apache.coyote.http11.AbstractHttp11Protocol;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class TomcatHeaderSizeCustomizer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers(connector -> {
            // Set Tomcat connector HTTP header size limit to 10MB (10,485,760 bytes)
            connector.setProperty("maxHttpHeaderSize", "10485760");
            if (connector.getProtocolHandler() instanceof AbstractHttp11Protocol<?> handler) {
                handler.setMaxHttpHeaderSize(10485760);
            }
        });
    }
}
