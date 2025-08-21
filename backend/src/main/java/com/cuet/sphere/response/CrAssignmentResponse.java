package com.cuet.sphere.response;

import lombok.Data;

@Data
public class CrAssignmentResponse {
    private String message;
    private String userEmail;
    private String department;
    private String batch;
    private String role;
    private boolean success;
}
