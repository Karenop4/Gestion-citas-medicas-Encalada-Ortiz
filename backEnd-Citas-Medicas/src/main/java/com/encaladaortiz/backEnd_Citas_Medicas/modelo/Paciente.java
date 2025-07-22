package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "pacientes")
public class Paciente extends Usuario {

    private String tipoSangre;

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL)
    private List<Cita> citas;

    public Paciente() {
    }

    public String getTipoSangre() {
        return tipoSangre;
    }

    public void setTipoSangre(String tipoSangre) {
        this.tipoSangre = tipoSangre;
    }

    public List<Cita> getCitas() {
        return citas;
    }

    public void setCitas(List<Cita> citas) {
        this.citas = citas;
    }

    @Override
    public String toString() {
        return "Paciente{" +
                "citas=" + citas +
                ", personalID=" + getPersonalID() +
                ", cedula='" + getCedula() + '\'' +
                ", nombre='" + getNombre() + '\'' +
                '}';
    }
}