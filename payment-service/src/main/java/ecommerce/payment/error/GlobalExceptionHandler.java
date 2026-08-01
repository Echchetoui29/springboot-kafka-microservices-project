package ecommerce.payment.error;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException e) {
    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> responseStatus(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getReason()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> fallback(Exception e) {
    log.error("unexpected error", e);
    return ResponseEntity.internalServerError().body(Map.of("error", "unexpected error"));
  }
}
