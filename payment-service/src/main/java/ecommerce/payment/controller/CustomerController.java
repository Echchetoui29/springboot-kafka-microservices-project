package ecommerce.payment.controller;

import ecommerce.payment.db.entities.Customer;
import ecommerce.payment.db.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/customers")
@RestController
public class CustomerController {

    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Customer> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Customer create(@RequestBody Customer customer) {
        if (customer.getName() == null || customer.getName().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (customer.getAmountAvailable() < 0) {
            throw new IllegalArgumentException("amountAvailable must be >= 0");
        }
        customer.setId(null);
        customer.setAmountReserved(0);
        return repository.save(customer);
    }
}
