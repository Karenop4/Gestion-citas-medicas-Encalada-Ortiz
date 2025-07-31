package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;

@Entity
@Table(name = "citas")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "fecha") // Hibernate suele mapear LocalDateTime a DATETIME/TIMESTAMP por defecto
    private LocalDate fecha;
    private LocalTime hora;
    private char estado;

    @ManyToOne
    @JoinColumn(name = "especialidad_id", referencedColumnName = "id",nullable = false)
    private Especialidad especialidad;
    @ManyToOne
    @JoinColumn(name = "medico_id", referencedColumnName = "personalID",nullable = false)
    private Medico medico;

    @ManyToOne
    @JoinColumn(name = "paciente_id", referencedColumnName = "personalID",nullable = false)
    private Paciente paciente;



    public Cita() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHora() {
        return hora;
    }

    public void setHora(LocalTime hora) {
        this.hora = hora;
    }

    public char getEstado() {
        return estado;
    }

    public void setEstado(char estado) {
        this.estado = estado;
    }

    public Medico getMedico() {
        return medico;
    }

    public void setMedico(Medico medico) {
        this.medico = medico;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }


    public Especialidad getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(Especialidad especialidad) {
        this.especialidad = especialidad;
    }

    @Override
    public String toString() {
        return "Cita{" +
                "id=" + id +
                ", fecha=" + fecha +
                ", hora=" + hora +
                ", estado=" + estado +
                ", medico=" + medico +
                ", paciente=" + paciente+
                '}';
    }
}