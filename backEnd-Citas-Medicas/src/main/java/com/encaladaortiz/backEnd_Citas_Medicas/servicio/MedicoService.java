package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.HorarioDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.DTO.MedicoDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Horario;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.HorarioRepository;
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
    private final HorarioRepository horarioRepository;

    public MedicoService(MedicoRepository medicoRepository, HorarioRepository horarioRepository) {
        this.repository = medicoRepository;
        this.horarioRepository = horarioRepository;
    }

    public Medico guardar(Medico medico) {
        if (medico.getHorario() != null && medico.getHorario().getId() != null) {
            Horario horarioExistente = horarioRepository.findById(medico.getHorario().getId())
                    .orElseThrow(() -> new RuntimeException("Horario no encontrado"));
            medico.setHorario(horarioExistente);
        }
        return repository.save(medico);
    }

    public List<MedicoDTO> listar() {
        List<Medico> medicos = repository.findAll();
        return medicos.stream()
                .map(this::convertToDTO) // Usa el método auxiliar para convertir
                .collect(Collectors.toList());
    }
    private MedicoDTO convertToDTO(Medico medico) {
        MedicoDTO medicoDTO = new MedicoDTO();
        medicoDTO.setId(medico.getPersonalID());
        medicoDTO.setNombre(medico.getNombre());
        // Asumiendo que Medico tiene una relación a Especialidad y que Especialidad tiene un 'nombre'
        if (medico.getEspecialidad() != null) {
            medicoDTO.setEspecialidadNombre(medico.getEspecialidad().getNombre());
        } else {
            medicoDTO.setEspecialidadNombre(null); // O un valor por defecto si no tiene especialidad
        }

        // Convertir Horario a HorarioDTO
        if (medico.getHorario() != null) {
            Horario horario = medico.getHorario();
            HorarioDTO horarioDTO = new HorarioDTO(
                    horario.getId(),
                    horario.isDescanso(),
                    horario.getDias(),
                    horario.getHoraDescanso() != null ? horario.getHoraDescanso(): null, // Convertir LocalTime a String
                    horario.getHoraFin() != null ? horario.getHoraFin() : null, // Convertir LocalTime a String
                    horario.getHoraInicio() != null ? horario.getHoraInicio() : null // Convertir LocalTime a String
            );
            medicoDTO.setHorario(horarioDTO);
        } else {
            medicoDTO.setHorario(null);
        }

        return medicoDTO;
    }


    public Optional<Medico> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    public Medico actualizar(Long id, Medico nuevo) {
        return repository.findById(id).map(m -> {
            // Campos heredados de Usuario
            m.setNombre(nuevo.getNombre());
            m.setCedula(nuevo.getCedula());
            m.setCorreo(nuevo.getCorreo());
            m.setTelefono(nuevo.getTelefono());
            m.setContactoC(nuevo.getContactoC());
            m.setDireccion(nuevo.getDireccion());
            m.setFechaNac(nuevo.getFechaNac());
            m.setEstadoC(nuevo.getEstadoC());
            m.setNacionalidad(nuevo.getNacionalidad());
            m.setUid(nuevo.getUid());
            m.setRol(nuevo.getRol());
            m.setGenero(nuevo.getGenero());
            // Campos específicos de Médico
            m.setEspecialidad(nuevo.getEspecialidad());
            m.setHorario(nuevo.getHorario());
            m.setEsMedico(nuevo.isEsMedico());
            m.setDatos(nuevo.isDatos());
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
            LocalTime horaInicioTrabajo = horario.getHoraInicio();
            LocalTime horaFinTrabajo = horario.getHoraFin();
            LocalTime horaInicioDescanso = null;
            LocalTime horaFinDescanso = null;
            if (horario.isDescanso() && horario.getHoraDescanso() != null ) {
                horaInicioDescanso = horario.getHoraDescanso();
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
    public Horario obtenerHorarioDeMedico(Long medicoPersonalId) {
        // Buscamos el médico por su personalid
        return repository.findByPersonalID(medicoPersonalId) // Asegúrate de tener este método en tu MedicoRepository
                .map(medico -> medico.getHorario()) // Obtenemos el objeto Horario asociado al médico
                .orElse(null); // Si el médico o su horario no se encuentra, devolvemos null
    }

    public Optional<Medico> buscarPorUid(String uid) {
        return repository.findByUid(uid);
    }

    public List<Medico> buscarPorEspecialidad(String nombreEspecialidad) {
        return repository.findByEspecialidad_Nombre(
                nombreEspecialidad
        );
    }
}
