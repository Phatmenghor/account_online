package com.internal.feature.master_data.repository;

import com.internal.feature.master_data.models.AccOnlineCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccOnlineCategoryRepository extends JpaRepository<AccOnlineCategory, Long> {

    @Query("SELECT a FROM AccOnlineCategory a WHERE " +
           "(:search IS NULL OR :search = '' " +
           "OR LOWER(a.lookupName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.lookupCode) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.lookupId ASC, a.lookupName ASC")
    List<AccOnlineCategory> findAllBySearch(@Param("search") String search);
}






