package com.pinpoint.backend.exception;

public class InvalidFolderOperationException extends RuntimeException {

    public InvalidFolderOperationException(String message) {
        super(message);
    }
}
