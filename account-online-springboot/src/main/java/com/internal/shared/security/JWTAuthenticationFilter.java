package com.internal.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Single unified HTTP Filter: Handles Correlation ID / MDC access logging & JWT Authentication.
 */
@Slf4j
@RequiredArgsConstructor
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String TRACE_ID_HEADER   = "X-Trace-ID";

    private final JWTGenerator tokenGenerator;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || shouldSkipLogging(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String traceId = resolveOrGenerateTraceId(request);
        String clientIp = getClientIp(request);
        long start = System.currentTimeMillis();

        MDC.put("traceId", traceId);
        MDC.put("requestId", traceId);
        MDC.put("method", request.getMethod());
        MDC.put("path", path);
        MDC.put("clientIp", clientIp);

        response.setHeader(REQUEST_ID_HEADER, traceId);
        response.setHeader(TRACE_ID_HEADER, traceId);

        try {
            String token = getJWTFromRequest(request);
            if (StringUtils.hasText(token) && tokenGenerator.validateToken(token)) {
                String username = tokenGenerator.getUsernameFromJWT(token);
                MDC.put("username", username);

                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

            filterChain.doFilter(request, response);

        } finally {
            long duration = System.currentTimeMillis() - start;
            int status = response.getStatus();
            MDC.put("statusCode", String.valueOf(status));
            MDC.put("duration", String.valueOf(duration));

            String responseMessage = MDC.get("responseMessage");
            String detailMsg = (responseMessage != null && !responseMessage.isBlank()) ? " — " + responseMessage : "";

            if (status >= 500) {
                log.error("[ApiFilter] {} {} → {} in {}ms (clientIp={}){}",
                        request.getMethod(), path, status, duration, clientIp, detailMsg);
            } else if (status >= 400) {
                log.warn("[ApiFilter] {} {} → {} in {}ms (clientIp={}){}",
                        request.getMethod(), path, status, duration, clientIp, detailMsg);
            } else {
                log.info("[ApiFilter] {} {} → {} in {}ms",
                        request.getMethod(), path, status, duration);
            }

            MDC.clear();
        }
    }

    private String getJWTFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private String resolveOrGenerateTraceId(HttpServletRequest request) {
        String header = request.getHeader(REQUEST_ID_HEADER);
        if (header == null || header.isBlank()) {
            header = request.getHeader(TRACE_ID_HEADER);
        }
        if (header != null && !header.isBlank()) {
            return header.trim();
        }
        return "mtb" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "UNKNOWN";
    }

    private boolean shouldSkipLogging(String path) {
        if (path == null) return false;
        return path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/actuator/health");
    }
}
