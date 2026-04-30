// package com.foodordering.order.exceptions;

// import jakarta.servlet.http.HttpServletRequest;
// import org.springframework.http.*;
// import org.springframework.web.ErrorResponse;
// import org.springframework.web.bind.MethodArgumentNotValidException;
// import org.springframework.web.bind.annotation.*;

// import java.time.LocalDateTime;
// import java.util.stream.Collectors;

// @RestControllerAdvice
// public class GlobalExceptionHandler {

//     // ================= CUSTOM EXCEPTIONS =================

//     @ExceptionHandler(OrderNotFoundException.class)
//     public ResponseEntity<ErrorResponse> handleOrderNotFound(
//             OrderNotFoundException ex,
//             HttpServletRequest request) {

//         return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request);
//     }

//     @ExceptionHandler(CartNotFoundException.class)
//     public ResponseEntity<ErrorResponse> handleCartNotFound(
//             CartNotFoundException ex,
//             HttpServletRequest request) {

//         return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request);
//     }

//     @ExceptionHandler(RestaurantNotFoundException.class)
//     public ResponseEntity<ErrorResponse> handleRestaurantNotFound(
//             RestaurantNotFoundException ex,
//             HttpServletRequest request) {

//         return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request);
//     }

//     @ExceptionHandler(InvalidOrderStateException.class)
//     public ResponseEntity<ErrorResponse> handleInvalidState(
//             InvalidOrderStateException ex,
//             HttpServletRequest request) {

//         return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
//     }

//     // ================= VALIDATION =================

//     @ExceptionHandler(MethodArgumentNotValidException.class)
//     public ResponseEntity<ErrorResponse> handleValidation(
//             MethodArgumentNotValidException ex,
//             HttpServletRequest request) {

//         String message = ex.getBindingResult()
//                 .getFieldErrors()
//                 .stream()
//                 .map(e -> e.getField() + ": " + e.getDefaultMessage())
//                 .collect(Collectors.joining(", "));

//         return buildResponse(message, HttpStatus.BAD_REQUEST, request);
//     }

//     // ================= FEIGN / EXTERNAL =================

//     @ExceptionHandler(Exception.class)
//     public ResponseEntity<ErrorResponse> handleGeneric(
//             Exception ex,
//             HttpServletRequest request) {

//         return buildResponse(
//                 "Internal Server Error: " + ex.getMessage(),
//                 HttpStatus.INTERNAL_SERVER_ERROR,
//                 request
//         );
//     }

//     // ================= HELPER =================

//     private ResponseEntity<ErrorResponse> buildResponse(
//             String message,
//             HttpStatus status,
//             HttpServletRequest request) {

//         ErrorResponse error = ErrorResponse.builder()
//                 .message(message)
//                 .status(status.value())
//                 .timestamp(LocalDateTime.now())
//                 .path(request.getRequestURI())
//                 .build();

//         return new ResponseEntity<>(error, status);
//     }
// }