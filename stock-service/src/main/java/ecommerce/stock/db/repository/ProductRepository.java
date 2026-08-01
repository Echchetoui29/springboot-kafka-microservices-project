package ecommerce.stock.db.repository;

import ecommerce.stock.db.entities.Product;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
  Optional<Product> findByName(String name);
}
