package com.smartcampus.api.exception;

public class DuplicateResourceNameException extends RuntimeException {
    public DuplicateResourceNameException(String message) {
        super(message);
    }
}