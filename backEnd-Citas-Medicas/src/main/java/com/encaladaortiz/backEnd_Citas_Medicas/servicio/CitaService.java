package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.CitaDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.CitaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class CitaService {

    private final CitaRepository repository;

    public CitaService(CitaRepository repository) {
        this.repository = repository;
    }

    public List<Cita> listar() {
        return repository.findAll();
    }

    public List<CitaDTO> listarporMedico(Long medicoID) {
        List<Cita> citas = repository.findByEstado('p');
        List<CitaDTO> citasDTO = new ArrayList<>();
        for (Cita cita : citas) {
            Long medicoID2 = cita.getMedico().getPersonalID();
            if (medicoID2.equals(medicoID)) {
                CitaDTO citaDTO=this.convertirADTO(cita);
                citasDTO.add(citaDTO);
            }
        }
        return citasDTO;
    }
    public CitaDTO convertirADTO(Cita cita) {
        Long id = cita.getId();
        Date fecha = cita.getFecha();
        LocalTime hora = cita.getHora();
        char estado = cita.getEstado();
        String nombre = cita.getNombre();
        String paciente = cita.getPaciente().getNombre();
        String medico = cita.getMedico().getNombre();
        CitaDTO citaDTO = new CitaDTO(id, fecha, hora, estado, nombre, medico, paciente);
        return citaDTO;
    }
    public Cita guardar(Cita cita) {
        return repository.save(cita);
    }

    public Optional<Cita> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
    public void cancelar(Long id) {
        repository.deleteById(id);
    }

    public Cita actualizar(Long id, Cita nueva) {
        return repository.findById(id).map(c -> {
            c.setFecha(nueva.getFecha());
            c.setHora(nueva.getHora());
            c.setEstado(nueva.getEstado());
            c.setPaciente(nueva.getPaciente());
            c.setMedico(nueva.getMedico());
            return repository.save(c);
        }).orElse(null);
    }
}
