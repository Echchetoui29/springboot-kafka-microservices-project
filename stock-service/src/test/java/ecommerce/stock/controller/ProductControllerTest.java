package ecommerce.stock.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import ecommerce.stock.db.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@EmbeddedKafka(partitions = 1)
class ProductControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ProductRepository repository;

  @Test
  void updateProductPriceAndAvailable() throws Exception {
    repository.deleteAll();
    String created =
        mockMvc
            .perform(
                post("/products")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\":\"zzz\",\"availableItems\":0,\"price\":1}"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    long id = repository.findByName("zzz").orElseThrow().getId();

    mockMvc.perform(
        put("/products/" + id)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"zzz\",\"price\":1,\"availableItems\":20}"));
  }
}
