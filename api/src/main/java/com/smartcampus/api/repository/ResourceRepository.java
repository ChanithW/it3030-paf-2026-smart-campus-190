package com.smartcampus.api.repository;

import com.smartcampus.api.enums.ResourceStatus;
import com.smartcampus.api.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, String> {
    List<Resource> findByType(String type);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByLocation(String location);
    List<Resource> findByTypeAndStatus(String type, ResourceStatus status);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
}