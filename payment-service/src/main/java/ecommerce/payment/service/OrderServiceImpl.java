package ecommerce.payment.service;

import static domain.OrderStatus.*;

import domain.Order;
import domain.OrderSource;
import domain.Topics;
import ecommerce.payment.db.entities.Customer;
import ecommerce.payment.db.repository.CustomerRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OrderServiceImpl implements OrderService {

  private static final OrderSource SOURCE = OrderSource.PAYMENT;
  private final CustomerRepository repository;
  private final KafkaTemplate<Long, Order> template;

  public OrderServiceImpl(CustomerRepository repository, KafkaTemplate<Long, Order> template) {
    this.repository = repository;
    this.template = template;
  }

  @Override
  public void reserve(Order order) {
    Customer customer = repository.findById(order.getCustomerId()).orElseThrow();
    log.info("reserve order [{}] , for customer[{}]", order.getId(), customer);
    if (order.getPrice() <= customer.getAmountAvailable()) {
      order.setStatus(ACCEPT);
      customer.setAmountReserved(customer.getAmountReserved() + order.getPrice());
      customer.setAmountAvailable(customer.getAmountAvailable() - order.getPrice());
    } else {
      order.setStatus(REJECT);
    }
    order.setSource(SOURCE);
    repository.save(customer);
    template.send(Topics.PAYMENTS, order.getId(), order);
    log.info("Sent: {}", order);
  }

  @Override
  public void confirm(Order order) {
    Customer customer = repository.findById(order.getCustomerId()).orElseThrow();
    log.info("confirm order [{}] , for customer[{}]", order.getId(), customer);
    if (order.getStatus().equals(CONFIRMED)) {
      customer.setAmountReserved(customer.getAmountReserved() - order.getPrice());
      repository.save(customer);
    } else if (order.getStatus().equals(ROLLBACK) && !order.getSource().equals(SOURCE)) {
      customer.setAmountReserved(customer.getAmountReserved() - order.getPrice());
      customer.setAmountAvailable(customer.getAmountAvailable() + order.getPrice());
      repository.save(customer);
    }
  }
}
