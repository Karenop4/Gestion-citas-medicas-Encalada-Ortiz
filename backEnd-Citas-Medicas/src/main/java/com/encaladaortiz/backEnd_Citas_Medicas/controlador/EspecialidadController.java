package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Especialidad;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.EspecialidadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/especialidades")
@CrossOrigin(origins = "*")
public class EspecialidadController {

    private final EspecialidadService service;

    public EspecialidadController(EspecialidadService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Especialidad>> listar() {
        List<Especialidad> especialidades = service.listar();
        return ResponseEntity.ok(especialidades);
    }

    @PostMapping
    public ResponseEntity<Especialidad> crear(@RequestBody Especialidad especialidad) {
        Especialidad nuevaEspecialidad = service.guardar(especialidad);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(nuevaEspecialidad.getId())
                .toUri();
        return ResponseEntity.created(location).body(nuevaEspecialidad);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Especialidad> obtener(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Especialidad> actualizar(
            @PathVariable Long id,
            @RequestBody Especialidad especialidad) {

        if (!id.equals(especialidad.getId())) {
            return ResponseEntity.badRequest().build();
        }

        return service.buscarPorId(id)
                .map(existente -> ResponseEntity.ok(service.guardar(especialidad)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Especialidad> cambiarEstado(
            @PathVariable Long id,
            @RequestParam boolean activa) {

        return service.buscarPorId(id)
                .map(especialidad -> {
                    especialidad.setActiva(activa);
                    return ResponseEntity.ok(service.guardar(especialidad));
                })
                .orElse(ResponseEntity.notFound().build());
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