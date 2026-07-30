package com.internal.shared.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * First filter in the chain. Responsible for:
 *  - Generating / propagating X-Request-ID
 *  - Populating MDC with: requestId, method, path
 *  - Measuring request duration
 *  - Logging structured access log entry at INFO level
 *  - Clearing ALL MDC keys at the end of the request
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String TRACE_ID_HEADER   = "X-Trace-ID";

    // Skip noisy health/metrics probes and static image requests from access logs
    private static final java.util.List<String> SKIP_PATH_PREFIXES = java.util.List.of(
            "/actuator/",
            "/api/images/",
            "/api/customer-images/",
            "/api/v1/customer-images/",
            "/customer-images/",
            "/images/",
            "/favicon.ico",
            "/webjars/"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {

        String path = request.getRequestURI();

        // Pass through silently for image, probe paths, and CORS OPTIONS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || shouldSkipLogging(path)) {
            chain.doFilter(request, response);
            return;
        }

        String traceId = resolveOrGenerate(request);
        long start = System.currentTimeMillis();

        MDC.put("traceId", traceId);
        MDC.put("requestId", traceId);
        MDC.put("method",  request.getMethod());
        MDC.put("path",    path);

        // Echo back to caller for correlation
        response.setHeader(REQUEST_ID_HEADER, traceId);
        response.setHeader(TRACE_ID_HEADER,   traceId);

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            int status = response.getStatus();
            MDC.put("statusCode", String.valueOf(status));
            MDC.put("duration",   String.valueOf(duration));

            String responseMessage = MDC.get("responseMessage");

            if (status >= 400 && responseMessage != null && !responseMessage.isBlank()) {
                if (status >= 500) {
                    log.error("{} {} → {} in {}ms — {}",
                            request.getMethod(), path, status, duration, responseMessage);
                } else {
                    log.warn("{} {} → {} in {}ms — {}",
                            request.getMethod(), path, status, duration, responseMessage);
                }
            } else {
                log.info("{} {} → {} in {}ms",
                        request.getMethod(), path, status, duration);
            }

            MDC.clear();
        }
    }

    private boolean shouldSkipLogging(String path) {
        if (path == null) return false;
        for (String prefix : SKIP_PATH_PREFIXES) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    private String resolveOrGenerate(HttpServletRequest request) {
        String incoming = request.getHeader(REQUEST_ID_HEADER);
        return (incoming != null && !incoming.isBlank()) ? incoming : UUID.randomUUID().toString();
    }
}
