package com.pinpoint.backend.exception;

public class MetadataFetchException extends RuntimeException {

    public MetadataFetchException(String message) {
        super(message);
    }

    public MetadataFetchException(String message, Throwable cause) {
        super(message, cause);
    }
}
