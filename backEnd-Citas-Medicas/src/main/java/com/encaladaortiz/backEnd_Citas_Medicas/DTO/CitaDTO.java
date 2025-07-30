package com.encaladaortiz.backEnd_Citas_Medicas.DTO;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;

public class CitaDTO {
    private Long id;
    private LocalDateTime fecha;
    private LocalTime hora;
    private char estado;
    private String medico;
    private String paciente;
    private String especialidad;

    public CitaDTO(Long id, LocalDateTime  fecha, LocalTime hora, char estado, String especialidad, String medico, String paciente) {
        this.id = id;
        this.fecha = fecha;
        this.hora = hora;
        this.estado = estado;
        this.especialidad = especialidad;
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
    public LocalDateTime  getFecha() {
        return fecha;
    }
    public void setFecha(LocalDateTime  fecha) {
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
    public String getEspecialidad() {
        return especialidad;
    }
    public void setNombre(String especialidad) {
        this.especialidad = especialidad;
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

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }
}
