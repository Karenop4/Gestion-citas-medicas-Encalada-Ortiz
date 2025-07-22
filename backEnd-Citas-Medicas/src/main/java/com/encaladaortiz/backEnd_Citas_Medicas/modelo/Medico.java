package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "medicos")
public class Medico extends Usuario {

    @ManyToOne
    @JoinColumn(name = "especialidad_id", nullable = false)
    private Especialidad especialidad;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "horario_id", unique = true)
    private Horario horario;

    @OneToMany(mappedBy = "medico", cascade = CascadeType.ALL)
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