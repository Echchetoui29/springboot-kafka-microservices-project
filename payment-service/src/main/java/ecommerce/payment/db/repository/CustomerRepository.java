package ecommerce.payment.db.repository;

import ecommerce.payment.db.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {}
