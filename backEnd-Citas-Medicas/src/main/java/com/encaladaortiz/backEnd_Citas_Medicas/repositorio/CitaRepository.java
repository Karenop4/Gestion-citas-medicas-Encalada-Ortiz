package com.encaladaortiz.backEnd_Citas_Medicas.repositorio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByEstado(char estado);

    List<Cita> findByEstadoAndFechaBetween(char estado, LocalDate startDate, LocalDate endDate);

    // ¡¡LA CORRECCIÓN FINAL ESTÁ AQUÍ!! Cambia '_Id' a '_PersonalID'
    List<Cita> findByMedico_PersonalIDAndEstadoAndFechaBetween( // <-- CAMBIO CLAVE: 'Medico_PersonalID'
                                                                Long medicoPersonalID, // Este parámetro es el personalID del Medico
                                                                char estado,
                                                                LocalDate startDate,
                                                                LocalDate endDate
    );
    List<Cita> findByFechaBetween(LocalDate inicio, LocalDate fin);

    @Query("SELECT c FROM Cita c " +
            "WHERE c.fecha BETWEEN :fechaInicio AND :fechaFin " +
            "AND (:especialidadId IS NULL OR c.especialidad.id = :especialidadId) " +
            "AND (:estadoChar IS NULL OR c.estado = :estadoChar) " +
            "AND (:pacienteId IS NULL OR c.paciente.personalID = :pacienteId) " +
            "AND (:medicoId IS NULL OR c.medico.personalID = :medicoId)")
    List<Cita> findFilteredAppointments(
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin,
            @Param("especialidadId") Long especialidadId,
            @Param("estadoChar") Character estadoChar,
            @Param("pacienteId") Long pacienteId,
            @Param("medicoId") Long medicoId);
}