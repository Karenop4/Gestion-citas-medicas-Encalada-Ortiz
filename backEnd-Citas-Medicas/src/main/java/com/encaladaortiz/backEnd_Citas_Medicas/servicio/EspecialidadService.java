package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Especialidad;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.EspecialidadRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EspecialidadService {

    private final EspecialidadRepository repository;

    public EspecialidadService(EspecialidadRepository repository) {
        this.repository = repository;
    }

    public List<Especialidad> listar() {
        return repository.findAll();
    }

    public Especialidad guardar(Especialidad especialidad) {
        return repository.save(especialidad);
    }

    public Optional<Especialidad> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    public Especialidad actualizar(Long id, Especialidad nueva) {
        return repository.findById(id).map(e -> {
            e.setNombre(nueva.getNombre());
            e.setActiva(nueva.isActiva());
            return repository.save(e);
        }).orElse(null);
    }
}
