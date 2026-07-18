package ecommerce.stock.listener;

import domain.*;
import ecommerce.stock.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OrderListener {

  private final OrderService orderService;

  @Autowired
  public OrderListener(OrderService orderService) {
    this.orderService = orderService;
  }

  @KafkaListener(id = Topics.ORDERS, topics = Topics.ORDERS, groupId = KafkaGroupIds.STOCK)
  public void onEvent(Order o) {
    log.info("Received: {}", o);
    if (o.getStatus().equals(OrderStatus.NEW)) orderService.reserve(o);
    else orderService.confirm(o);
  }
}
