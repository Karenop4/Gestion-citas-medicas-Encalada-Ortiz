package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

// Ejemplo: com.encaladaortiz.backEnd_Citas_Medicas.servicio.UsuarioService.java
import com.encaladaortiz.backEnd_Citas_Medicas.DTO.UsuarioDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Usuario; // Tu entidad de Usuario
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.UsuarioRepository; // Tu repositorio
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public UsuarioDTO findByFirebaseUid(String firebaseUid) {
        Usuario usuario = usuarioRepository.findByuid(firebaseUid).orElse(null);

        if (usuario != null) {
            return convertToDTO(usuario); // Convierte tu entidad a un DTO para enviar al frontend
        }
        return null;
    }

    // Método de ejemplo para convertir la entidad Usuario a un DTO para el frontend
    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setPersonalID(usuario.getPersonalID());
        dto.setNombre(usuario.getNombre());
        dto.setCorreo(usuario.getCorreo());
        dto.setRol(usuario.getRol()); // Asegúrate de que el rol tenga el formato 'a' o 'p'
        // Copia otras propiedades relevantes
        return dto;
    }
}