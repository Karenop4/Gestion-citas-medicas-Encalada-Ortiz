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

    List<Cita> findByEstadoAndFechaBetween(char estado, LocalDate startDate, LocalDate endDate);

    // ¡¡LA CORRECCIÓN FINAL ESTÁ AQUÍ!! Cambia '_Id' a '_PersonalID'
    List<Cita> findByMedico_PersonalIDAndEstadoAndFechaBetween( // <-- CAMBIO CLAVE: 'Medico_PersonalID'
                                                                Long medicoPersonalID, // Este parámetro es el personalID del Medico
                                                                char estado,
                                                                LocalDate startDate,
                                                                LocalDate endDate
    );

    // Si también tienes este método, ajústalo de la misma manera:
    List<Cita> findByMedico_PersonalIDAndEstado(Long medicoPersonalID, char estado); // <-- CAMBIO CLAVE: 'Medico_PersonalID'

    List<Cita> findByFechaBetween(LocalDate inicio, LocalDate fin);
}