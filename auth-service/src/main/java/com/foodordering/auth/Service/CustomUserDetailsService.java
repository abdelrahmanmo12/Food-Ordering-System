// package com.foodordering.auth.Service;
// import org.springframework.security.core.userdetails.*;
// import org.springframework.stereotype.Service;

// import com.foodordering.auth.Entity.user;
// import com.foodordering.auth.Repo.UserRepo;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import java.util.List;

// @Service
// public class CustomUserDetailsService implements UserDetailsService {

//     @Autowired
//     UserRepo repo;

//     @Override
//     public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

//         user user = repo.findByUsername(username);

//         if (user == null) {
//             throw new UsernameNotFoundException("User not found");
//         }

        

//         return new org.springframework.security.core.userdetails.User(
//                 user.getUsername(),
//                 user.getPassword(),
//                 List.of(new SimpleGrantedAuthority("ROLE_"+ user.getRole().toUpperCase()))
//         );
//     }
// }