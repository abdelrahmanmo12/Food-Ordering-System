package com.foodordering.user.Service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;



@Service
public class AuthClient {

    
    @Autowired
    RestTemplate restTemplate;

    

    public void promoteToOwner(String username) {

        String url = "http://localhost:8081/auth/make-owner/" + username;

        restTemplate.postForObject(url, null, String.class);
    }

    
}