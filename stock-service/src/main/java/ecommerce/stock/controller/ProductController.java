package ecommerce.stock.controller;

import ecommerce.stock.db.entities.Product;
import ecommerce.stock.db.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/products")
@RestController
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Product> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (product.getAvailableItems() < 0) {
            throw new IllegalArgumentException("availableItems must be >= 0");
        }
        product.setId(null);
        product.setReservedItems(0);
        return repository.save(product);
    }
}
