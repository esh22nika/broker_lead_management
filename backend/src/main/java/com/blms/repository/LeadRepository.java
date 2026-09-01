package com.blms.repository;

import com.blms.model.Lead;
import com.blms.model.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    List<Lead> findByStatus(LeadStatus status);

    @Query("SELECT l FROM Lead l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(l.contactEmail) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(l.contactPhone) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(l.source) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Lead> search(@Param("query") String query);

    long countByStatus(LeadStatus status);
}
