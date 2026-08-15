package ecommerce.order.service;

import static domain.OrderSource.*;
import static domain.OrderStatus.*;

import domain.Order;
import domain.OrderSource;
import domain.OrderStatus;
import domain.Topics;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicLong;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.streams.StoreQueryParameters;
import org.apache.kafka.streams.state.KeyValueIterator;
import org.apache.kafka.streams.state.QueryableStoreTypes;
import org.apache.kafka.streams.state.ReadOnlyKeyValueStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.config.StreamsBuilderFactoryBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OrderServiceImpl implements OrderService {

  private final AtomicLong sequence = new AtomicLong();
  private final KafkaTemplate<Long, Order> kafkaTemplate;
  private final StreamsBuilderFactoryBean kafkaStreamsFactory;

  @Autowired
  public OrderServiceImpl(
      KafkaTemplate<Long, Order> kafkaTemplate, StreamsBuilderFactoryBean kafkaStreamsFactory) {
    this.kafkaTemplate = kafkaTemplate;
    this.kafkaStreamsFactory = kafkaStreamsFactory;
  }

  @Override
  public Order create(Order order) {
    validate(order);
    order.setId(nextId());
    order.setStatus(OrderStatus.NEW);
    order.setCreatedAt(System.currentTimeMillis());
    log.info("Sent: {}", order);
    try {
      return kafkaTemplate
          .send(Topics.ORDERS, order.getId(), order)
          .get()
          .getProducerRecord()
          .value();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("interrupted while publishing order", e);
    } catch (ExecutionException e) {
      throw new IllegalStateException("failed to publish order", e.getCause());
    }
  }

  @Override
  public List<Order> all() {
    List<Order> orders = new ArrayList<>();
    KeyValueIterator<Long, Order> it = store().all();
    it.forEachRemaining(kv -> orders.add(kv.value));
    return orders;
  }

  @Override
  public Order get(Long id) {
    return store().get(id);
  }

  private ReadOnlyKeyValueStore<Long, Order> store() {
    return kafkaStreamsFactory
        .getKafkaStreams()
        .store(
            StoreQueryParameters.fromNameAndType(
                Topics.ORDERS, QueryableStoreTypes.keyValueStore()));
  }

  private long nextId() {
    return System.currentTimeMillis() * 1000 + (sequence.incrementAndGet() % 1000);
  }

  private void validate(Order order) {
    if (order.getCustomerId() == null || order.getProductId() == null) {
      throw new IllegalArgumentException("customerId and productId are required");
    }
    if (order.getPrice() <= 0) {
      throw new IllegalArgumentException("price must be positive");
    }
    if (order.getProductCount() <= 0) {
      throw new IllegalArgumentException("productCount must be positive");
    }
  }

  @Override
  public Order confirm(Order orderPayment, Order orderStock) {

    Order o =
        Order.builder()
            .id(orderPayment.getId())
            .customerId(orderPayment.getCustomerId())
            .productId(orderPayment.getProductId())
            .productCount(orderPayment.getProductCount())
            .price(orderPayment.getPrice())
            .createdAt(orderPayment.getCreatedAt())
            .build();

    if (orderPayment.getStatus().equals(ACCEPT) && orderStock.getStatus().equals(ACCEPT)) {
      o.setStatus(CONFIRMED);
    } else if (orderPayment.getStatus().equals(REJECT) && orderStock.getStatus().equals(REJECT)) {
      o.setStatus(REJECTED);
    } else if (orderPayment.getStatus().equals(REJECT) || orderStock.getStatus().equals(REJECT)) {
      OrderSource source = orderPayment.getStatus().equals(REJECT) ? PAYMENT : STOCK;
      o.setStatus(OrderStatus.ROLLBACK);
      o.setSource(source);
    }
    return o;
  }
}
