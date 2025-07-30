package com.encaladaortiz.backEnd_Citas_Medicas.controlador;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.MedicoDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Horario;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Paciente;
import com.encaladaortiz.backEnd_Citas_Medicas.servicio.CitaService;
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/medicos")
@CrossOrigin(origins = "*")
public class MedicoController {
    @Autowired
    private CitaService citaService;
    private final MedicoService  service;
    public MedicoController(MedicoService service) {
        this.service = service;
    }


    @PostMapping
    public ResponseEntity<Medico> crear(@RequestBody Medico Medico) {
        Medico nuevoMedico = service.guardar(Medico);
        return ResponseEntity.ok(nuevoMedico);
    }




    @PutMapping("/put/{id}")
    public ResponseEntity<Medico> actualizar(@PathVariable Long id, @RequestBody Medico medico) {
        Medico actualizado = service.actualizar(id, medico);
        if (actualizado != null) {
            return ResponseEntity.ok(actualizado);
        } else {
            return ResponseEntity.notFound().build();
        }
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
            return ResponseEntity.ok(diasDisponibles);
        }
        return ResponseEntity.ok(diasDisponibles);
    }
    @GetMapping("/{id}/horarioGeneral")
    public ResponseEntity<Horario> obtenerHorarioGeneralMedico(@PathVariable("id") Long id) {
        Horario horario = service.obtenerHorarioDeMedico(id);

        if (horario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(horario); // Devuelve el objeto Horario completo
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{id}/citas-confirmadas/pdf")
    public ResponseEntity<byte[]> descargarReporteCitasConfirmadasPorMedicoPdf(@PathVariable Long id) {
        try {
            byte[] pdfBytes = citaService.generarReporteCitasConfirmadasPorMedicoPdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", "reporte_citas_confirmadas_medico_" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Endpoint para descargar PDF de citas confirmadas por especialidad
    // Nota: aunque está en MedicoController, es para Especialidad, se puede mover
    // a un EspecialidadController o ReporteController si la estructura crece.
    @GetMapping("/especialidad/{id}/citas-confirmadas/pdf")
    public ResponseEntity<byte[]> descargarReporteCitasConfirmadasPorEspecialidadPdf(@PathVariable("id") Long especialidadId) {
        try {
            byte[] pdfBytes = citaService.generarReporteCitasConfirmadasPorEspecialidadPdf(especialidadId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", "reporte_citas_confirmadas_especialidad_" + especialidadId + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/uid/{uid}")
    public ResponseEntity<MedicoDTO> obtenerPorUid(@PathVariable String uid) {
        return service.buscarPorUid(uid)
                .map(medico -> {
                    MedicoDTO dto = new MedicoDTO(
                            medico.getPersonalID(),
                            medico.getNombre(),
                            medico.getCedula(),
                            medico.getEspecialidad() != null ? medico.getEspecialidad().getNombre() : null,
                            medico.getContactoC(),
                            medico.getTelefono(),
                            medico.getCorreo(),
                            medico.isDatos(),
                            medico.getDireccion(),
                            medico.getEstadoC(),
                            medico.getGenero(),
                            medico.getNacionalidad(),
                            medico.getFechaNac(),
                            medico.getRol(),
                            medico.getUid(),
                            medico.isEsMedico()
                    );
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Medico>> listarTodosLosMedicos() {
        List<Medico> medicos = service.listar();
        return ResponseEntity.ok(medicos);
    }

    @GetMapping("/porEspecialidad")
    public ResponseEntity<List<Medico>> obtenerPorEspecialidad(@RequestParam String nombreEspecialidad) {
        List<Medico> medicos = service.buscarPorEspecialidad(nombreEspecialidad);
        return ResponseEntity.ok(medicos);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Medico> obtener(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
