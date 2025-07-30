package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "medicos")
public class Medico extends Usuario {
    @ManyToOne
    @JoinColumn(name = "especialidad_id", nullable = true)
    private Especialidad especialidad;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER) // <--- ¡Confirma que sigue así!
    @JoinColumn(name = "horario_id", unique = true, referencedColumnName = "id") // <--- Y esto es CRUCIAL. "id" es la PK de la tabla 'horarios'.
    private Horario horario;

    @OneToMany(mappedBy = "medico", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Cita> citas;

    public Medico() {
    }

    public Especialidad getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(Especialidad especialidad) {
        this.especialidad = especialidad;
    }

    public Horario getHorario() {
        return horario;
    }

    public void setHorario(Horario horario) {
        this.horario = horario;
    }

    public List<Cita> getCitas() {
        return citas;
    }

    public void setCitas(List<Cita> citas) {
        this.citas = citas;
    }

    @Override
    public String toString() {
        return "Medico{" +
                "especialidad=" + especialidad +
                ", horario=" + horario +
                ", citas=" + citas +
                ", personalID=" + getPersonalID() +
                ", cedula='" + getCedula() + '\'' +
                ", nombre='" + getNombre() + '\'' +
                '}';
    }
}