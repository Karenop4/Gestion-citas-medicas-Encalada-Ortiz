package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.CitaDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.DTO.EstadoDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.CitaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
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
    @GetMapping("/confirmadas/rango")
    public ResponseEntity<List<CitaDTO>> getConfirmedAppointmentsInDateRange(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        try {
            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);
            List<CitaDTO> citas = citaService.getConfirmedAppointmentsInDateRange(startDate, endDate);
            return new ResponseEntity<>(citas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping("/medico/{medicoId}/confirmadas/rango")
    public ResponseEntity<List<CitaDTO>> getConfirmedAppointmentsByMedicoInDateRange(
            @PathVariable Long medicoId,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        try {
            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);
            List<CitaDTO> citas = citaService.getConfirmedAppointmentsByMedicoInDateRange(medicoId, startDate, endDate);
            return new ResponseEntity<>(citas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping("/porMedico/{MedicoID}")
    public ResponseEntity<List<CitaDTO> > obtenerCitasPorMedico(@PathVariable Long MedicoID) {
        List<CitaDTO> citas = citaService.listarporMedico(MedicoID);
        return ResponseEntity.ok(citas);
    }
    @GetMapping("/porMedico/confirmadas/{MedicoID}")
    public ResponseEntity<List<CitaDTO> > obtenerCitasConfirmadasMedico(@PathVariable Long MedicoID) {
        List<CitaDTO> citas = citaService.citasConfirmadasPorMedico(MedicoID);
        return ResponseEntity.ok(citas);
    }
    @GetMapping("/porMedico/confirmadas-rango/{MedicoID}")
    public ResponseEntity<List<CitaDTO>> getCitasConfirmadasMedicoEnRango(
            @PathVariable("MedicoID") Long medicoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        List<CitaDTO> citas = citaService.getCitasConfirmadasMedicoEnRango(medicoId, fechaInicio, fechaFin);
        return ResponseEntity.ok(citas);
    }
    @GetMapping("/porPaciente/{PacienteID}")
    public ResponseEntity<List<CitaDTO> > obtenerCitasPorPaciente(@PathVariable Long PacienteID) {
        List<CitaDTO> citas = citaService.listarporPaciente(PacienteID);
        return ResponseEntity.ok(citas);
    }
    @GetMapping("/porEspecialidad/{EspecialidadID}")
    public ResponseEntity<List<CitaDTO> > obtenerCitasPorEspecialidad(@PathVariable Long EspecialidadID) {
        List<CitaDTO> citas = citaService.listarporEspecialidad(EspecialidadID);
        return ResponseEntity.ok(citas);
    }
    @GetMapping("/porEspecialidad/confirmadas/{EspecialidadID}")
    public ResponseEntity<List<CitaDTO> > obtenerCitasConfirmadasEspecialidad(@PathVariable Long EspecialidadID) {
        List<CitaDTO> citas = citaService.citasConfirmadasPorEspecialidad(EspecialidadID);
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

    @GetMapping("/filtrar")
    public ResponseEntity<List<CitaDTO>> getFilteredCitas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) Long especialidadId,
            @RequestParam(required = false) Character estado,
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) Long medicoId) {

        // Opcional: Validación para asegurar que solo se pasa pacienteId o medicoId, no ambos
        if (pacienteId != null && medicoId != null) {
            return ResponseEntity.badRequest().body(null);
        }

        List<CitaDTO> citas = citaService.getFilteredCitas(
                fechaInicio,
                fechaFin,
                especialidadId,
                estado,
                pacienteId,
                medicoId);

        if (citas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(citas);
    }
}
