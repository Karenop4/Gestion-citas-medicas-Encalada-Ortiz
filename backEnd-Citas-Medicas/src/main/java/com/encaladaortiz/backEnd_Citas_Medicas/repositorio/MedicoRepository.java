package com.encaladaortiz.backEnd_Citas_Medicas.repositorio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicoRepository extends JpaRepository<Medico,Long> {
}
