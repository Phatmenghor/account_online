package com.internal.shared.component;

import com.internal.shared.security.JWTGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtComponent {

    private final JWTGenerator jwtGenerator;

    public String generateToken(Authentication authentication) {
        return jwtGenerator.generateToken(authentication);
    }

    public String generateTokenForUser(String username, List<String> roles) {
        return jwtGenerator.generateTokenForUser(username, roles);
    }

    public String getUsernameFromJWT(String token) {
        return jwtGenerator.getUsernameFromJWT(token);
    }

    public List<String> getRolesFromJWT(String token) {
        return jwtGenerator.getRolesFromJWT(token);
    }

    public long getTokenExpirationTime(String token) {
        return jwtGenerator.getTokenExpirationTime(token);
    }

    public boolean validateToken(String token) {
        return jwtGenerator.validateToken(token);
    }
}

