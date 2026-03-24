package com.pinpoint.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pinpoint.backend.entity.Folder;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findAllByOrderByNameAsc();
}
