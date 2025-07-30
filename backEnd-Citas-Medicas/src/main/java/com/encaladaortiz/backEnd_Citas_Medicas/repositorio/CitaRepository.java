package com.encaladaortiz.backEnd_Citas_Medicas.repositorio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByEstado(char estado);
    List<Cita> findByMedicoPersonalIDAndEstado(Long medicoPersonalID, String estado);
    List<Cita> findByEspecialidadIdAndEstado(Long especialidadId, String estado);
    List<Cita> findByMedicoPersonalIDAndEstadoAndFechaBetween(
            Long medicoPersonalID,
            Character estado,
            LocalDateTime fechaInicio, // <-- ¡Cambia a LocalDateTime!
            LocalDateTime fechaFin     // <-- ¡Cambia a LocalDateTime!
    );
}