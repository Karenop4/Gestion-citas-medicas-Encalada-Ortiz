package com.encaladaortiz.backEnd_Citas_Medicas.DTO;

import java.time.LocalTime;
import java.util.Date;

public class CitaDTO {
    private Long id;
    private Date fecha;
    private LocalTime hora;
    private char estado;
    private String nombre;
    private String medico;
    private String paciente;

    public CitaDTO(Long id, Date fecha, LocalTime hora, char estado, String nombre, String medico, String paciente) {
        this.id = id;
        this.fecha = fecha;
        this.hora = hora;
        this.estado = estado;
        this.nombre = nombre;
        this.medico = medico;
        this.paciente = paciente;
    }
    public CitaDTO() {}
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Date getFecha() {
        return fecha;
    }
    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }
    public char getEstado() {
        return estado;
    }
    public void setEstado(char estado) {
        this.estado = estado;
    }
    public LocalTime getHora() {
        return hora;
    }
    public void setHora(LocalTime hora) {
        this.hora = hora;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getMedico() {
        return medico;
    }

    public void setMedico(String medico) {
        this.medico = medico;
    }

    public String getPaciente() {
        return paciente;
    }

    public void setPaciente(String paciente) {
        this.paciente = paciente;
    }
}
