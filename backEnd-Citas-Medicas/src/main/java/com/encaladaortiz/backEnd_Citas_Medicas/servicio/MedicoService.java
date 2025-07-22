package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.MedicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
}
