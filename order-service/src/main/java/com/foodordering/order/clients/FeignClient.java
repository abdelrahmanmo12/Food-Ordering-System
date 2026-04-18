package com.foodordering.order.clients;

public @interface FeignClient {
    String name();

    String url();
}
