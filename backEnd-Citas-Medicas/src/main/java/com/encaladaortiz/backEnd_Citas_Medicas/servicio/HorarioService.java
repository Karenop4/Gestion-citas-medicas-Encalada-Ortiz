package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.HorarioDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Horario;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.HorarioRepository;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.MedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Para transacciones

import java.util.List;
import java.util.Optional;

@Service
public class HorarioService {

    private final HorarioRepository repository;
    @Autowired
    private MedicoRepository medicoRepository; // Para actualizar el medico.horario


    public HorarioService(HorarioRepository repository) {
        this.repository = repository;
    }

    public List<Horario> listar() {
        return repository.findAll();
    }

    public Horario guardar(Horario horario) {
        return repository.save(horario);
    }

    public Optional<Horario> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    public Horario actualizar(Long id, Horario nuevo) {
        return repository.findById(id).map(h -> {
            h.setDias(nuevo.getDias());
            h.setHoraInicio(nuevo.getHoraInicio());
            h.setHoraFin(nuevo.getHoraFin());
            h.setDescanso(nuevo.isDescanso());
            h.setHoraDescanso(nuevo.getHoraDescanso());
            return repository.save(h);
        }).orElse(null);
    }

    @Transactional
    public Horario saveOrUpdateHorario(HorarioDTO horarioDTO, Long medicoId) {
        Horario horario;

        if (horarioDTO.getId() != null) {
            // Es una actualización: buscar el horario existente
            horario = repository.findById(horarioDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Horario no encontrado con ID: " + horarioDTO.getId()));
        } else {
            // Es una creación de un nuevo horario
            horario = new Horario();
        }

        // Mapear DTO a entidad
        horario.setDescanso(horarioDTO.isDescanso());
        horario.setDias(horarioDTO.getDias());
        horario.setHoraDescanso(horarioDTO.getHoraDescanso());
        horario.setHoraFin(horarioDTO.getHoraFin());
        horario.setHoraInicio(horarioDTO.getHoraInicio());

        Horario savedHorario = repository.save(horario);

        // *** Importante: Asociar este horario al médico si es nuevo o ha cambiado ***
        Medico medico = medicoRepository.findByPersonalID(medicoId) // Asegúrate de la capitalización correcta
                .orElseThrow(() -> new RuntimeException("Médico no encontrado con ID: " + medicoId));

        // Solo actualiza si el horario del médico es diferente o si es un horario nuevo
        if (medico.getHorario() == null || !medico.getHorario().getId().equals(savedHorario.getId())) {
            medico.setHorario(savedHorario);
            medicoRepository.save(medico); // Guarda el médico para actualizar la FK
        }

        return savedHorario;
    }
}
