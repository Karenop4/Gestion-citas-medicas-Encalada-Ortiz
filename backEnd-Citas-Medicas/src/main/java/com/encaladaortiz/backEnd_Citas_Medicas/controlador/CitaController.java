package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.CitaDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.DTO.EstadoDTO;
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

    @GetMapping("/porMedico/{MedicoID}")
    public ResponseEntity<List<CitaDTO> > obtenerCitasPorMedico(@PathVariable Long MedicoID) {
        List<CitaDTO> citas = citaService.listarporMedico(MedicoID);
        return ResponseEntity.ok(citas);
    }
    @GetMapping("/porPaciente/{PacienteID}")
    public ResponseEntity<List<CitaDTO> > obtenerCitasPorPaciente(@PathVariable Long PacienteID) {
        List<CitaDTO> citas = citaService.listarporPaciente(PacienteID);
        return ResponseEntity.ok(citas);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CitaDTO> actualizarEstadoCita(@PathVariable Long id, @RequestBody EstadoDTO estadoDto) {
        Optional<Cita> existenteO = citaService.buscarPorId(id);
        if (!existenteO.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Cita existente = existenteO.get();
        existente.setEstado(estadoDto.getEstado());
        Cita actualizada = citaService.actualizar(id, existente);
        CitaDTO dto = citaService.convertirADTO(actualizada);
        return ResponseEntity.ok(dto);
    }
}
