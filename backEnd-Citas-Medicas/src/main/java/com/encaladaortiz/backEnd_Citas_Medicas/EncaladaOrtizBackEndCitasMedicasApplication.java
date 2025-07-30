package com.encaladaortiz.backEnd_Citas_Medicas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaRepositories("com.encaladaortiz.backEnd_Citas_Medicas.repositorio")
@EntityScan("com.encaladaortiz.backEnd_Citas_Medicas.modelo")
@EnableScheduling
public class EncaladaOrtizBackEndCitasMedicasApplication {
	public static void main(String[] args) {
		SpringApplication.run(EncaladaOrtizBackEndCitasMedicasApplication.class, args);
	}
}
