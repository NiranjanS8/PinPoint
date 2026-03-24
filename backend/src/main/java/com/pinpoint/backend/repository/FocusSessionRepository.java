package com.pinpoint.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pinpoint.backend.entity.FocusSession;

public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {

    List<FocusSession> findAllByCompletedAtBetweenOrderByCompletedAtAsc(LocalDateTime start, LocalDateTime end);

    List<FocusSession> findAllByOrderByCompletedAtAsc();
}
