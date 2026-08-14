package ecommerce.payment.controller;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

import ecommerce.payment.db.repository.CustomerRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@EmbeddedKafka(partitions = 1)
class CustomerControllerRestAssuredTest {

  @LocalServerPort private int port;

  @Autowired private CustomerRepository repository;

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
    repository.deleteAll();
  }

  @Test
  void createAndGetCustomer() {
    long id =
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"alice\",\"amountAvailable\":100}")
            .when()
            .post("/customers")
            .then()
            .statusCode(200)
            .body("name", equalTo("alice"))
            .body("amountAvailable", equalTo(100))
            .body("id", notNullValue())
            .extract()
            .jsonPath()
            .getLong("id");

    given().when().get("/customers/" + id).then().statusCode(200).body("name", equalTo("alice"));
  }

  @Test
  void createDuplicateNameReturnsConflict() {
    given()
        .contentType(ContentType.JSON)
        .body("{\"name\":\"bob\",\"amountAvailable\":50}")
        .when()
        .post("/customers")
        .then()
        .statusCode(200);

    given()
        .contentType(ContentType.JSON)
        .body("{\"name\":\"bob\",\"amountAvailable\":50}")
        .when()
        .post("/customers")
        .then()
        .statusCode(409);
  }

  @Test
  void updateCustomer() {
    long id =
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"carol\",\"amountAvailable\":10}")
            .when()
            .post("/customers")
            .then()
            .extract()
            .jsonPath()
            .getLong("id");

    given()
        .contentType(ContentType.JSON)
        .body("{\"name\":\"carol\",\"amountAvailable\":999}")
        .when()
        .put("/customers/" + id)
        .then()
        .statusCode(200)
        .body("amountAvailable", equalTo(999));
  }

  @Test
  void deleteCustomer() {
    long id =
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"dave\",\"amountAvailable\":10}")
            .when()
            .post("/customers")
            .then()
            .extract()
            .jsonPath()
            .getLong("id");

    given().when().delete("/customers/" + id).then().statusCode(204);

    given().when().get("/customers/" + id).then().statusCode(404);
  }
}
