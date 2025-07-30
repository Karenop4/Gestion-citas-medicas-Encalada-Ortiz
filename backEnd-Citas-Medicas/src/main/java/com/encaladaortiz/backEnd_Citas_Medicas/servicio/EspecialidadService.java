package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.EspecialidadDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Especialidad;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.EspecialidadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EspecialidadService {

    private final EspecialidadRepository repository;

    public EspecialidadService(EspecialidadRepository repository) {
        this.repository = repository;
    }

    public List<EspecialidadDTO> listar() {
        List<Especialidad> especialidades = repository.findAll();
        return especialidades.stream()
                .map(e -> new EspecialidadDTO(e.getId(), e.getNombre(), e.isActiva()))
                .collect(Collectors.toList());
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

    private EspecialidadDTO convertToDto(Especialidad especialidad) {
        EspecialidadDTO dto = new EspecialidadDTO();
        dto.setId(especialidad.getId());
        dto.setNombre(especialidad.getNombre());
        dto.setActiva(especialidad.isActiva()); // Asumiendo que tu entidad tiene getActiva()
        return dto;
    }
    // Método para mapear DTO a Entidad (para crear/actualizar)
    private Especialidad convertToEntity(EspecialidadDTO dto) {
        Especialidad especialidad = new Especialidad();
        // No seteamos el ID aquí si es una creación, Hibernate/JPA lo manejará.
        // Si es una actualización, el ID se usará para buscar la entidad existente.
        especialidad.setNombre(dto.getNombre());
        especialidad.setActiva(dto.getActiva() != null ? dto.getActiva() : true); // Valor por defecto
        return especialidad;
    }
    @Transactional(readOnly = true)
    public List<EspecialidadDTO> findAll() { // Crea un nuevo método para especialidades activas
        return repository.findByActivaTrue().stream() // Necesitarás este método en el repo
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    @Transactional
    public EspecialidadDTO deactivateById(Long id) { // Cambia el nombre a deactivateById o softDelete
        Especialidad especialidad = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada con ID: " + id));
        especialidad.setActiva(false); // <--- ¡Marcar como inactiva!
        return convertToDto(repository.save(especialidad));
    }
    @Transactional(readOnly = true)
    public Optional<EspecialidadDTO> findById(Long id) {
        return repository.findById(id).map(this::convertToDto);
    }
    @Transactional
    public EspecialidadDTO create(EspecialidadDTO especialidadDTO) {
        if (repository.findByNombreIgnoreCase(especialidadDTO.getNombre()).isPresent()) {
            throw new IllegalArgumentException("Ya existe una especialidad con este nombre.");
        }
        Especialidad especialidad = convertToEntity(especialidadDTO);
        especialidad.setId(null); // Asegurar que el ID sea nulo para que JPA lo genere
        Especialidad savedEspecialidad = repository.save(especialidad);
        return convertToDto(savedEspecialidad);
    }
    @Transactional
    public EspecialidadDTO update(Long id, EspecialidadDTO especialidadDetailsDTO) {
        Especialidad especialidad = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada con ID: " + id));

        // Validación: Si el nombre está siendo cambiado a uno que ya existe en otra especialidad
        Optional<Especialidad> existing = repository.findByNombreIgnoreCase(especialidadDetailsDTO.getNombre());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new IllegalArgumentException("Ya existe otra especialidad con este nombre.");
        }

        especialidad.setNombre(especialidadDetailsDTO.getNombre());
        especialidad.setActiva(especialidadDetailsDTO.getActiva() != null ? especialidadDetailsDTO.getActiva() : especialidad.isActiva()); // Actualiza el estado si se envía, si no, mantén el actual
        Especialidad updatedEspecialidad = repository.save(especialidad);
        return convertToDto(updatedEspecialidad);
    }
    @Transactional
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Especialidad no encontrada con ID: " + id);
        }
        repository.deleteById(id);
    }
}
