package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "horarios")
public class Horario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dias;

    private String horaInicio;

    private String horaFin;

    private boolean descanso;

    private String horaDescanso;

    public Horario() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDias() {
        return dias;
    }

    public void setDias(String dias) {
        this.dias = dias;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public String getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }

    public boolean isDescanso() {
        return descanso;
    }

    public void setDescanso(boolean descanso) {
        this.descanso = descanso;
    }

    public String getHoraDescanso() {
        return horaDescanso;
    }

    public void setHoraDescanso(String horaDescanso) {
        this.horaDescanso = horaDescanso;
    }

    @Override
    public String toString() {
        return "Horario{" +
                "id=" + id +
                ", dias='" + dias + '\'' +
                '}';
    }
}