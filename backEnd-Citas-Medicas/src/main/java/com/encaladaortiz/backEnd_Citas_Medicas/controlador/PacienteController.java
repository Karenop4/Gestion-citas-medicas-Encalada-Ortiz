package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.PacienteDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Paciente;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
public class PacienteController {

    private final PacienteService pacienteService;

    @Autowired
    public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }

    @GetMapping
    public ResponseEntity<List<Paciente>> listarTodos() {
        List<Paciente> lista = pacienteService.listar();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/uid/{uid}")
    public ResponseEntity<PacienteDTO> obtenerPorUid(@PathVariable String uid) {
        return pacienteService.obtenerPorUid(uid)
                .map(paciente -> {
                    PacienteDTO dto = new PacienteDTO(
                            paciente.getPersonalID(),
                            paciente.getNombre(),
                            paciente.getCedula(),
                            paciente.getContactoC(),
                            paciente.getTelefono(),
                            paciente.getCorreo(),
                            paciente.isDatos(),
                            paciente.getDireccion(),
                            paciente.getEstadoC(),
                            paciente.getGenero(),
                            paciente.getNacionalidad(),
                            paciente.getFechaNac(),
                            paciente.getRol(),
                            paciente.getUid(),
                            paciente.getTipoSangre()
                    );
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    public ResponseEntity<Paciente> crear(@RequestBody Paciente paciente) {
        Paciente nuevo = pacienteService.guardar(paciente);
        return ResponseEntity.ok(nuevo);
    }

    @PutMapping("/put/{id}")
    public ResponseEntity<Paciente> actualizar(@PathVariable Long id, @RequestBody Paciente paciente) {
        Paciente actualizado = pacienteService.actualizar(id, paciente);
        if (actualizado != null) {
            return ResponseEntity.ok(actualizado);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pacienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
