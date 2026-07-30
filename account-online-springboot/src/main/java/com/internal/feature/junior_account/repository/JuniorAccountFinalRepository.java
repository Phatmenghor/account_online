package com.internal.feature.junior_account.repository;

import com.internal.feature.junior_account.models.JuniorAccountFinal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JuniorAccountFinalRepository extends JpaRepository<JuniorAccountFinal, UUID>, JpaSpecificationExecutor<JuniorAccountFinal> {

    Optional<JuniorAccountFinal> findByLegalId(String legalId);

    Optional<JuniorAccountFinal> findTopByLegalIdOrderByCreatedAtDesc(String legalId);

    Optional<JuniorAccountFinal> findByCif(String cif);

    boolean existsByPhoneNumber(String phoneNumber);

    Optional<JuniorAccountFinal> findByPhoneNumber(String phoneNumber);
}
