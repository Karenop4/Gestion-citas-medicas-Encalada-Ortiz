package com.encaladaortiz.backEnd_Citas_Medicas.repositorio;

// Ejemplo: com.encaladaortiz.backEnd_Citas_Medicas.repositorio.UsuarioRepository.java
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método para buscar un usuario por su UID de Firebase
    Optional<Usuario> findByuid(String firebaseUid);
}