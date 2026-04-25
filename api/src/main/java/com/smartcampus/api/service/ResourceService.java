package com.smartcampus.api.service;

import com.smartcampus.api.dto.ResourceRequest;
import com.smartcampus.api.enums.ResourceStatus;
import com.smartcampus.api.exception.BookingConflictException;
import com.smartcampus.api.exception.DuplicateResourceNameException;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.Resource;
import com.smartcampus.api.repository.BookingRepository;
import com.smartcampus.api.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status);
    }

    public List<Resource> getResourcesByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    public Resource createResource(ResourceRequest request) {
        String normalizedName = request.getName().trim();
        if (resourceRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new DuplicateResourceNameException("A resource with this name already exists");
        }

        Resource resource = Resource.builder()
                .name(normalizedName)
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .availabilityWindows(request.getAvailabilityWindows())
                .status(request.getStatus())
                .description(request.getDescription())
                .build();
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, ResourceRequest request) {
        Resource resource = getResourceById(id);
        String normalizedName = request.getName().trim();
        if (resourceRepository.existsByNameIgnoreCaseAndIdNot(normalizedName, id)) {
            throw new DuplicateResourceNameException("A resource with this name already exists");
        }

        resource.setName(normalizedName);
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setStatus(request.getStatus());
        resource.setDescription(request.getDescription());
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        Resource resource = getResourceById(id);

        if (!bookingRepository.findByResourceId(id).isEmpty()) {
            throw new BookingConflictException(
                    "Cannot delete this facility because it has related bookings. "
                            + "Cancel or remove related bookings first."
            );
        }

        resourceRepository.delete(resource);
    }
}
