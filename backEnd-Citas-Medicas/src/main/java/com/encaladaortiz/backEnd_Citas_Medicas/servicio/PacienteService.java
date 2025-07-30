package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Paciente;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.PacienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PacienteService {

    private final PacienteRepository repository;

    public PacienteService(PacienteRepository repository) {
        this.repository = repository;
    }

    public List<Paciente> listar() {
        return repository.findAll();
    }

    public Paciente guardar(Paciente paciente) {
        return repository.save(paciente);
    }

    public Optional<Paciente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    public Paciente actualizar(Long id, Paciente nuevo) {
        return repository.findById(id).map(p -> {
            p.setNombre(nuevo.getNombre());
            p.setCedula(nuevo.getCedula());
            p.setContactoC(nuevo.getContactoC());
            p.setTelefono(nuevo.getTelefono());
            p.setCorreo(nuevo.getCorreo());
            p.setFechaNac(nuevo.getFechaNac());
            p.setDireccion(nuevo.getDireccion());
            p.setEstadoC(nuevo.getEstadoC());
            p.setNacionalidad(nuevo.getNacionalidad());
            p.setUid(nuevo.getUid());
            p.setTipoSangre(nuevo.getTipoSangre());
            p.setRol(nuevo.getRol()); // <- si estás usando un char como 'p' o 'a'
            return repository.save(p);
        }).orElse(null);
    }


    public Optional<Paciente> obtenerPorUid(String uid) {
        return repository.findByUid(uid);
    }
}
