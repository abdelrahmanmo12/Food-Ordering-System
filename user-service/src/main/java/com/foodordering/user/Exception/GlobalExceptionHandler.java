package com.foodordering.user.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.foodordering.user.Dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(RequestNotFound.class)
    public ResponseEntity<?> handleRequstNotFound(RequestNotFound ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage(), "404"));
    }


    @ExceptionHandler(RequestAlreadyPending.class)
    public ResponseEntity<?> handleRequstAlreadyPending(RequestAlreadyPending ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(ex.getMessage(), "400" ));
    }

    @ExceptionHandler(RequestAlreadyProcessed.class)
    public ResponseEntity<?> handleRequestAlreadyProcessed(RequestAlreadyProcessed ex){
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse(ex.getMessage(), "409" ));
    }


}