package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.CitaRepository;
import org.springframework.stereotype.Service;

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

    public Cita guardar(Cita cita) {
        return repository.save(cita);
    }

    public Optional<Cita> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
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
