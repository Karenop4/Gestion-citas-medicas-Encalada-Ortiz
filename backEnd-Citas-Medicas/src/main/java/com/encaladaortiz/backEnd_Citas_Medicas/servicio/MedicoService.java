package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Horario;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.MedicoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MedicoService {

    private final MedicoRepository repository;

    public MedicoService(MedicoRepository repository) {
        this.repository = repository;
    }

    public List<Medico> listar() {
        return repository.findAll();
    }

    public Medico guardar(Medico medico) {
        return repository.save(medico);
    }

    public Optional<Medico> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    public Medico actualizar(Long id, Medico nuevo) {
        return repository.findById(id).map(m -> {
            m.setNombre(nuevo.getNombre());
            m.setCedula(nuevo.getCedula());
            m.setEspecialidad(nuevo.getEspecialidad());
            m.setHorario(nuevo.getHorario());
            return repository.save(m);
        }).orElse(null);
    }
    public List<Medico> listarPorEspecialidad(String nombreEspecialidad) {
        return repository.findByEspecialidad_Nombre(nombreEspecialidad);
    }
    //Devuelve una lista con las horas que el medico trabaja
    public List<String> diponibilidadPorDia(Long medicoId, LocalDate fecha) {
        Optional<Medico> medicoOptional = repository.findById(medicoId);
        if (medicoOptional.isEmpty()) {
            return new ArrayList<>();
        }
        Medico medico = medicoOptional.get();
        Horario horario = medico.getHorario();
        if (horario == null) {
            return new ArrayList<>();
        }
        int diaDeLaSemanaSolicitado = fecha.getDayOfWeek().getValue();
        Set<Integer> diasHabiles = Arrays.stream(horario.getDias().split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toSet());
        boolean trabajaEsteDia = diasHabiles.contains(diaDeLaSemanaSolicitado);
        if (!trabajaEsteDia) {
            return new ArrayList<>();
        }
        List<String> franjas = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        try {
            LocalTime horaInicioTrabajo = LocalTime.parse(horario.getHoraInicio(), formatter);
            LocalTime horaFinTrabajo = LocalTime.parse(horario.getHoraFin(), formatter);
            LocalTime horaInicioDescanso = null;
            LocalTime horaFinDescanso = null;
            if (horario.isDescanso() && horario.getHoraDescanso() != null && !horario.getHoraDescanso().isEmpty()) {
                horaInicioDescanso = LocalTime.parse(horario.getHoraDescanso(), formatter);
                horaFinDescanso = horaInicioDescanso.plusHours(1); // Descanso de 1 hora
            }
            LocalTime currentSlot = horaInicioTrabajo;
            while (currentSlot.isBefore(horaFinTrabajo)) {
                LocalTime nextSlot = currentSlot.plusMinutes(60);
                if (nextSlot.isAfter(horaFinTrabajo)) {
                    nextSlot = horaFinTrabajo;
                }
                boolean enDescanso = false;
                if (horario.isDescanso() && horaInicioDescanso != null && horaFinDescanso != null) {
                    if (currentSlot.isBefore(horaFinDescanso) && nextSlot.isAfter(horaInicioDescanso)) {
                        enDescanso = true;
                    }
                }
                if (!enDescanso) {
                    franjas.add(currentSlot.format(formatter) + "-" + nextSlot.format(formatter));
                }
                currentSlot = nextSlot;
            }
        } catch (Exception e) {
            return new ArrayList<>();
        }
        return franjas;
    }
    public String obtenerDiasDisponiblesMedico(Long medicoId) {
        Optional<Medico> medicoOptional = repository.findById(medicoId);

        if (medicoOptional.isEmpty()) {
            return null; // O podrías devolver una cadena vacía "" si lo prefieres para "no encontrado"
        }

        Medico medico = medicoOptional.get();
        Horario horario = medico.getHorario();

        if (horario == null || horario.getDias() == null || horario.getDias().isEmpty()) {
            return null; // O "" si prefieres una cadena vacía para "sin horario"
        }

        // Simplemente devolvemos la cadena de días tal cual
        return horario.getDias();
    }
}
