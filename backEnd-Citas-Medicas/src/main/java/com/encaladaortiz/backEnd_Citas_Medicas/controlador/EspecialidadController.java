package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.EspecialidadDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Especialidad;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.EspecialidadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

    // En tu controlador
    @GetMapping
    public ResponseEntity<List<EspecialidadDTO>> getAllEspecialidades() {
        List<EspecialidadDTO> especialidades = service.findAll();
        return new ResponseEntity<>(especialidades, HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<EspecialidadDTO> getEspecialidadById(@PathVariable Long id) {
        return service.findById(id)
                .map(especialidad -> new ResponseEntity<>(especialidad, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<?> createEspecialidad(@RequestBody EspecialidadDTO especialidadDTO) {
        try {
            EspecialidadDTO createdEspecialidad = service.create(especialidadDTO);
            return new ResponseEntity<>(createdEspecialidad, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear la especialidad: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEspecialidad(@PathVariable Long id, @RequestBody EspecialidadDTO especialidadDetailsDTO) {
        try {
            EspecialidadDTO updatedEspecialidad = service.update(id, especialidadDetailsDTO);
            return new ResponseEntity<>(updatedEspecialidad, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar la especialidad: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
    public ResponseEntity<?> deleteEspecialidad(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al eliminar la especialidad: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PatchMapping("/{id}/deactivate") // Usar PATCH para una actualización parcial (solo 'activa')
    public ResponseEntity<?> deactivateEspecialidad(@PathVariable Long id) {
        try {
            service.deactivateById(id);
            return new ResponseEntity<>(HttpStatus.OK); // O NO_CONTENT
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al desactivar la especialidad: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}