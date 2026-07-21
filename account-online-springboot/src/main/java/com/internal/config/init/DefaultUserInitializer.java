package com.internal.config.init;

import com.internal.enumation.RoleEnum;
import com.internal.enumation.StatusData;
import com.internal.feature.auth.models.Role;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.auth.repository.RoleRepository;
import com.internal.feature.auth.repository.UserRepository;
import com.internal.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DefaultUserInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    @Override
    public void run(String... args) {
        log.info("Initializing default roles and users...");
        
        initializeRoles();
        
        if (appProperties.getDefaultUsers().isCreate()) {
            createDefaultSuperAdminUser();
        } else {
            log.info("Default user creation is disabled");
        }
        
        log.info("Role and user initialization completed");
    }

    private void initializeRoles() {
        Arrays.stream(RoleEnum.values()).forEach(roleEnum -> {
            if (!roleRepository.existsByName(roleEnum)) {
                Role role = new Role();
                role.setName(roleEnum);
                roleRepository.save(role);
                log.info("Created role: {}", roleEnum);
            }
        });
    }

    private void createDefaultSuperAdminUser() {
        String superCard = appProperties.getSuperUser().getIdCard();
        String superPassword = appProperties.getSuperUser().getPassword();

        if (userRepository.existsByUsername(superCard)) {
            log.info("Developer user already exists: {}", superCard);
            return;
        }

        Role role = roleRepository.findByName(RoleEnum.DEVELOPER)
                .orElseThrow(() -> new RuntimeException("DEVELOPER role not found"));

        UserEntity user = new UserEntity();
        user.setUsername(superCard);
        user.setStatus(StatusData.ACTIVE);
        user.setPassword(passwordEncoder.encode(superPassword));

        List<Role> roles = new ArrayList<>();
        roles.add(role);
        user.setRoles(roles);

        userRepository.save(user);
        log.info("Created developer user: {}", superCard);
    }
}





