package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.MedicoDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.MedicoService;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.MedicoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medicos")
@CrossOrigin(origins = "*")
public class MedicoController {
    private final MedicoService  service;
    public MedicoController(MedicoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Medico>> listar() {
        List<Medico> Medico = service.listar();
        return ResponseEntity.ok(Medico);
    }

    @PostMapping
    public ResponseEntity<Medico> crear(@RequestBody Medico Medico) {
        Medico nuevoMedico = service.guardar(Medico);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(nuevoMedico.getPersonalID())
                .toUri();
        return ResponseEntity.created(location).body(nuevoMedico);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medico> obtener(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/porEspecialidad")
    public ResponseEntity<List<MedicoDTO>> obtenerporEspecialidad(@RequestParam String nombreEspecialidad) {
        List<Medico> medicos = service.listarPorEspecialidad(nombreEspecialidad);
        List<MedicoDTO> dtos = medicos.stream()
                .map(m -> new MedicoDTO(
                        m.getPersonalID(),
                        m.getNombre(),
                        m.getCedula(),
                        m.getEspecialidad().getNombre()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medico> actualizar(
            @PathVariable Long id,
            @RequestBody Medico Medico) {

        if (!id.equals(Medico.getPersonalID())) {
            return ResponseEntity.badRequest().build();
        }

        return service.buscarPorId(id)
                .map(existente -> ResponseEntity.ok(service.guardar(Medico)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<List<String>> obtenerDisponibilidad(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        List<String> franjasDisponibles = service.diponibilidadPorDia(id, fecha);

        if (franjasDisponibles.isEmpty()) {
            return ResponseEntity.ok(franjasDisponibles);
        }
        return ResponseEntity.ok(franjasDisponibles);
    }
    @GetMapping("/{id}/diasDisponibles")
    public ResponseEntity<String> obtenerDiasDisponiblesMedico(@PathVariable Long id) {
        String diasDisponibles = service.obtenerDiasDisponiblesMedico(id);

        if (diasDisponibles.isEmpty()) {
            // Podrías devolver un 204 No Content si prefieres,
            // pero 200 OK con lista vacía es un patrón común para "no hay resultados"
            return ResponseEntity.ok(diasDisponibles);
        }
        return ResponseEntity.ok(diasDisponibles);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
