package school.sptech.bruvifit_app;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(
		title = "Bruvifit API",
		version = "v1",
		description = "Documentação dos endpoints da API Bruvifit."
))
public class BruvifitAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(BruvifitAppApplication.class, args);
	}

}
