package com.internal.shared.security;

import com.internal.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.List;

/**
 * Enhanced JWT Generator with improved role handling and token management.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JWTGenerator {

    private final JwtProperties jwtProperties;

    private Key getSigningKey() {
        return new SecretKeySpec(jwtProperties.getSecret().getKey().getBytes(), SignatureAlgorithm.HS512.getJcaName());
    }

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();

        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        Date currentDate = new Date();
        long expirationTimeInMs = jwtProperties.getExpirationMin() * 60 * 1000;
        Date expireDate = new Date(currentDate.getTime() + expirationTimeInMs);

        log.info("Generating token for user: {}", username);

        return Jwts.builder()
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .setSubject(username)
                .setIssuer(jwtProperties.getIssuer())
                .claim("roles", roles)
                .claim("created", currentDate.getTime())
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateTokenForUser(String username, List<String> roles) {
        Date currentDate = new Date();
        long expirationTimeInMs = jwtProperties.getExpirationMin() * 60 * 1000;
        Date expireDate = new Date(currentDate.getTime() + expirationTimeInMs);
        return Jwts.builder()
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .setSubject(username)
                .setIssuer(jwtProperties.getIssuer())
                .claim("roles", roles)
                .claim("created", currentDate.getTime())
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromJWT(String token) {
        Claims claims = parseToken(token);
        return (List<String>) claims.get("roles");
    }

    public long getTokenExpirationTime(String token) {
        Claims claims = parseToken(token);
        Date expiration = claims.getExpiration();
        Date now = new Date();

        long diff = expiration.getTime() - now.getTime();
        return Math.max(0, diff / 1000);
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (ExpiredJwtException ex) {
            log.debug("JWT token expired: {}", ex.getMessage());
            return false;
        } catch (Exception ex) {
            log.warn("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }

    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
