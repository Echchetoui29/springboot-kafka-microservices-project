package ecommerce.order.controller;

import domain.Order;
import ecommerce.order.service.OrderService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequestMapping("/orders")
@RestController
public class OrderController {

  private final OrderService orderService;

  @Autowired
  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping
  public Order create(@RequestBody Order order) {
    return orderService.create(order);
  }

  @GetMapping
  public List<Order> all() {
    return orderService.all();
  }

  @GetMapping("/{id}")
  public ResponseEntity<Order> get(@PathVariable Long id) {
    Order order = orderService.get(id);
    return order == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(order);
  }
}
