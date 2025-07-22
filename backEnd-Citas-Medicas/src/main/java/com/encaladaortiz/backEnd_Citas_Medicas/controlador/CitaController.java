package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.CitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*") // permite solicitudes desde cualquier origen
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    @GetMapping
    public List<Cita> listarCitas() {
        return citaService.listar();
    }

    @PostMapping
    public Cita crearCita(@RequestBody Cita cita) {
        return citaService.guardar(cita);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> obtenerCita(@PathVariable Long id) {
        Optional<Cita> cita = citaService.buscarPorId(id);
        return cita.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCita(@PathVariable Long id) {
        if (citaService.buscarPorId(id).isPresent()) {
            citaService.eliminar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cita> actualizarCita(@PathVariable Long id, @RequestBody Cita nueva) {
        Cita actualizada = citaService.actualizar(id, nueva);
        if (actualizada != null) {
            return ResponseEntity.ok(actualizada);
        }
        return ResponseEntity.notFound().build();
    }
}
