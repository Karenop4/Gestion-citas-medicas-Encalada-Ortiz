package com.encaladaortiz.backEnd_Citas_Medicas.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "especialidades")
public class Especialidad {

    @Id
    @JsonIgnoreProperties(value = { "created_at", "updated_at" }, allowGetters = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private boolean activa;

    public Especialidad() {
        this.activa = true;
    }

    public Especialidad(String nombre) {
        this.nombre = nombre;
        this.activa = true;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }

    @Override
    public String toString() {
        return "Especialidad{" + "id=" + id + ", nombre=" + nombre + ", activa=" + activa + '}';
    }
}
