package com.pinpoint.backend.repository;

import com.pinpoint.backend.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findAllByOrderByNameAsc();

    List<Folder> findAllByParentIdOrderByNameAsc(Long parentId);

    Optional<Folder> findByParentIdAndNameIgnoreCase(Long parentId, String name);

    Optional<Folder> findByParentIsNullAndNameIgnoreCase(String name);

    List<Folder> findAllByIdIn(Collection<Long> ids);
}
