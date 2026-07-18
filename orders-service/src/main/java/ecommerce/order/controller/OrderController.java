package ecommerce.order.controller;

import domain.Order;
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
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.config.StreamsBuilderFactoryBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequestMapping("/orders")
@RestController
public class OrderController {

  private final AtomicLong sequence = new AtomicLong();
  private final KafkaTemplate<Long, Order> kafkaTemplate;
  private final StreamsBuilderFactoryBean kafkaStreamsFactory;

  @Autowired
  public OrderController(
      KafkaTemplate<Long, Order> kafkaTemplate, StreamsBuilderFactoryBean kafkaStreamsFactory) {
    this.kafkaTemplate = kafkaTemplate;
    this.kafkaStreamsFactory = kafkaStreamsFactory;
  }

  @PostMapping
  public Order create(@RequestBody Order order) {
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

  @GetMapping
  public List<Order> all() {
    List<Order> orders = new ArrayList<>();
    KeyValueIterator<Long, Order> it = store().all();
    it.forEachRemaining(kv -> orders.add(kv.value));
    return orders;
  }

  @GetMapping("/{id}")
  public ResponseEntity<Order> get(@PathVariable Long id) {
    Order order = store().get(id);
    return order == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(order);
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
}
