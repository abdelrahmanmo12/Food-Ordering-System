    package com.foodordering.restaurant.config;

    import com.foodordering.restaurant.dtos.UserDTO;

    public class UserContext {
        private static final ThreadLocal<UserDTO> userHolder = new ThreadLocal<>();

        public static void setUser(UserDTO user) { userHolder.set(user); }
        public static UserDTO getUser() { return userHolder.get(); }
        public static void clear() { userHolder.remove(); }
    }