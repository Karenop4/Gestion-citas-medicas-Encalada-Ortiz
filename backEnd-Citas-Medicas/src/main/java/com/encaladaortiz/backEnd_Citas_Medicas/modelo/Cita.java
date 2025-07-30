package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

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
    private LocalDateTime fecha;
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

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "notificacion_id", unique = true)
    private Notificacion notificacion;

    public Cita() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
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

    public Notificacion getNotificacion() {
        return notificacion;
    }

    public void setNotificacion(Notificacion notificacion) {
        this.notificacion = notificacion;
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
                ", paciente=" + paciente +
                ", notificacion=" + notificacion +
                '}';
    }
}