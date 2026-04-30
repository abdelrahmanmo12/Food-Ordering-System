package com.foodordering.auth.dto.Response;


public class LoginResponse {
    private String token;
    private String role;
    private long accountId;
    private String refreshToken;
    private String message;
    

    
    public LoginResponse(String token, String role, long accountId, String refreshToken, String message) {
        this.accountId = accountId;
        this.role = role;
        this.token = token;
        this.refreshToken = refreshToken;
        this.message = message;
        
    }
    public LoginResponse(String message, String role, long accountId) {
        this.accountId = accountId;
        this.role = role;
        this.message = message;

    }
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public long getAccountId() {
        return accountId;
    }
    public void setAccountId(long accountId) {
        this.accountId = accountId;
    }
}
