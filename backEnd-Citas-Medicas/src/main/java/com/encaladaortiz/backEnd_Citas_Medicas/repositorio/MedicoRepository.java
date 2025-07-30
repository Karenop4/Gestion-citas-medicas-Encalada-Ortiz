package com.encaladaortiz.backEnd_Citas_Medicas.repositorio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico,Long> {
    List<Medico> findByEspecialidad_Nombre(String nombre);
    Optional<Medico> findByPersonalID(Long personalid);
    @Query("SELECT m FROM Medico m JOIN FETCH m.horario WHERE m.personalID = :medicoId")
    Optional<Medico> findByPersonalIDWithHorario(@Param("medicoId") Long medicoId);

    Optional<Medico> findByUid(String uid);
}