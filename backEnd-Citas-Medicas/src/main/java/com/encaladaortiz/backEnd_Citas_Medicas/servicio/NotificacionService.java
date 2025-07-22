package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Notificacion;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.NotificacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificacionService {

    private final NotificacionRepository repository;

    public NotificacionService(NotificacionRepository repository) {
        this.repository = repository;
    }

    public List<Notificacion> listar() {
        return repository.findAll();
    }

    public Notificacion guardar(Notificacion notificacion) {
        return repository.save(notificacion);
    }

    public Optional<Notificacion> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    public Notificacion actualizar(Long id, Notificacion nueva) {
        return repository.findById(id).map(n -> {
            n.setDetalle(nueva.getDetalle());
            n.setFechaEnvio(nueva.getFechaEnvio());
            n.setCita(nueva.getCita());
            return repository.save(n);
        }).orElse(null);
    }
}
