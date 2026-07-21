package com.internal.shared.component;

import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

@Component
public class ClientIpComponent {

    private static final String[] IP_HEADER_NAMES = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED"
    };

    /**
     * Extracts IP address from the current request thread context
     */
    public String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                return extractIpAddress(attributes.getRequest());
            }
        } catch (Exception ignored) {}
        return "Unknown";
    }

    /**
     * Extracts IP address from an explicit HttpServletRequest
     */
    public String extractIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "Unknown";
        }
        for (String header : IP_HEADER_NAMES) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return truncate(ip, 45);
            }
        }
        String remoteAddr = request.getRemoteAddr();
        return truncate(remoteAddr != null ? remoteAddr : "Unknown", 45);
    }

    private String truncate(String val, int maxLen) {
        if (val == null) return null;
        return val.length() > maxLen ? val.substring(0, maxLen) : val;
    }
}
