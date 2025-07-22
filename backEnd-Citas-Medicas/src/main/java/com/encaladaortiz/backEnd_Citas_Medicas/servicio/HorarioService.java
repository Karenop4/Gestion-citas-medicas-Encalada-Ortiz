package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Horario;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.HorarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HorarioService {

    private final HorarioRepository repository;

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
}
