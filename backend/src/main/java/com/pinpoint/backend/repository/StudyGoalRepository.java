package com.pinpoint.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pinpoint.backend.entity.StudyGoal;

public interface StudyGoalRepository extends JpaRepository<StudyGoal, Long> {

    List<StudyGoal> findAllByOrderByCompletedAscTargetDateAscCreatedAtAsc();
}
