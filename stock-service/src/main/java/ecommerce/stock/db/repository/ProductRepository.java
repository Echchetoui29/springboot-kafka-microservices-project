package ecommerce.stock.db.repository;

import ecommerce.stock.db.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {}
