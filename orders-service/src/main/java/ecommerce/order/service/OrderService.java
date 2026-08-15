package ecommerce.order.service;

import domain.Order;
import java.util.List;

public interface OrderService {

  Order confirm(Order orderPayment, Order orderStock);

  Order create(Order order);

  List<Order> all();

  Order get(Long id);
}
