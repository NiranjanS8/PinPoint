package com.pinpoint.backend.exception;

public class StudyGoalNotFoundException extends RuntimeException {

    public StudyGoalNotFoundException(String message) {
        super(message);
    }
}
