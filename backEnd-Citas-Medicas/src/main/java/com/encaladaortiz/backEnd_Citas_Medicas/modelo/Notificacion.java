package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String detalle;

    private Date fechaEnvio;

    @OneToOne(mappedBy = "notificacion")
    private Cita cita;

    public Notificacion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public Date getFechaEnvio() {
        return fechaEnvio;
    }

    public void setFechaEnvio(Date fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    @Override
    public String toString() {
        return "Notificacion{" +
                "id=" + id +
                ", detalle='" + detalle + '\'' +
                ", fechaEnvio=" + fechaEnvio +
                ", cita=" + cita +
                '}';
    }
}