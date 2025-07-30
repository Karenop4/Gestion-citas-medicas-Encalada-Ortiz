package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "horarios")
public class Horario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // O GenerationType.AUTO si es como lo manejas
    @Column(name = "id") // <--- ¡Asegúrate que el nombre de la columna es 'id' en la DB!
    private Long id;

    private boolean descanso;
    private String dias;
    private LocalTime horaDescanso; // Usar LocalTime
    private LocalTime horaFin;      // Usar LocalTime
    private LocalTime horaInicio;

    public Horario() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isDescanso() {
        return descanso;
    }

    public void setDescanso(boolean descanso) {
        this.descanso = descanso;
    }

    public String getDias() {
        return dias;
    }

    public void setDias(String dias) {
        this.dias = dias;
    }

    public LocalTime getHoraDescanso() {
        return horaDescanso;
    }

    public void setHoraDescanso(LocalTime horaDescanso) {
        this.horaDescanso = horaDescanso;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }
}