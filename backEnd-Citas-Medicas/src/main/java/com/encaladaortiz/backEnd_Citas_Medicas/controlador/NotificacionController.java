package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Notificacion;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
public class NotificacionController {

        private final NotificacionService service;

        public NotificacionController(NotificacionService service) {
            this.service = service;
        }

        @GetMapping
        public ResponseEntity<List<Notificacion>> listar() {
            List<Notificacion> Notificacion = service.listar();
            return ResponseEntity.ok(Notificacion);
        }

        @PostMapping
        public ResponseEntity<Notificacion> crear(@RequestBody Notificacion Notificacion) {
            Notificacion nuevaNotificacion = service.guardar(Notificacion);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(nuevaNotificacion.getId())
                    .toUri();
            return ResponseEntity.created(location).body(nuevaNotificacion);
        }

        @GetMapping("/{id}")
        public ResponseEntity<Notificacion> obtener(@PathVariable Long id) {
            return service.buscarPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        @PutMapping("/{id}")
        public ResponseEntity<Notificacion> actualizar(
                @PathVariable Long id,
                @RequestBody Notificacion Notificacion) {

            if (!id.equals(Notificacion.getId())) {
                return ResponseEntity.badRequest().build();
            }

            return service.buscarPorId(id)
                    .map(existente -> ResponseEntity.ok(service.guardar(Notificacion)))
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
