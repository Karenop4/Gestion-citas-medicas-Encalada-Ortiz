package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Notificacion;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.CitaRepository;
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
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final CitaRepository citaRepository;

    public NotificacionController(NotificacionService notificacionService, CitaRepository citaRepository) {
        this.notificacionService = notificacionService;
        this.citaRepository = citaRepository;
    }

    @PostMapping("/enviar/{citaId}")
    public ResponseEntity<String> enviarNotificacion(@PathVariable Long citaId) {
        Cita cita = citaRepository.findById(citaId).orElse(null);
        if (cita == null) {
            return ResponseEntity.notFound().build();
        }

        notificacionService.enviarNotificacionManual(cita);
        return ResponseEntity.ok("Notificación enviada para la cita " + citaId);
    }
}

