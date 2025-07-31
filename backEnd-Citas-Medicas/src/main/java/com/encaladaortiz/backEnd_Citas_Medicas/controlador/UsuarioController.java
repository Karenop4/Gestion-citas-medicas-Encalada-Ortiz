package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.UsuarioDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Usuario; // Tu entidad de Usuario
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.UsuarioService; // Tu servicio para manejar usuarios
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;
    /**
     * Endpoint para obtener el perfil del usuario por su UID de Firebase.
     * @param firebaseUid El UID de Firebase del usuario.
     * @return El objeto Usuario (o un DTO de Usuario) de tu base de datos.
     */
    @GetMapping("/porFirebaseUid")
    public ResponseEntity<UsuarioDTO> getUserByFirebaseUid(@RequestParam("uid") String firebaseUid) {
        UsuarioDTO userDTO = usuarioService.findByFirebaseUid(firebaseUid);

        if (userDTO != null) {
            return ResponseEntity.ok(userDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}