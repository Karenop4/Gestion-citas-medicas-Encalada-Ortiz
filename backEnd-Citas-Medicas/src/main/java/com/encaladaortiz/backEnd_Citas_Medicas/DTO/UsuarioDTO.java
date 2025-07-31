package com.encaladaortiz.backEnd_Citas_Medicas.DTO;

import jakarta.persistence.*;

import java.util.Date;

public class UsuarioDTO {
    private Long personalID;
    private String cedula;
    private String nombre;
    private String contactoC;
    private String telefono;
    private String correo;
    private boolean datos;
    private String direccion;
    private String estadoC;
    private String genero;
    private String nacionalidad;
    private Date fechaNac;
    private char rol;
    private String uid;
    private boolean esMedico;
    public UsuarioDTO() {}
    public UsuarioDTO(String cedula, Long personalID, String nombre, String contactoC, String telefono, String correo, boolean datos, String direccion, String estadoC, String genero, Date fechaNac, String nacionalidad, char rol, String uid, boolean esMedico) {
        this.cedula = cedula;
        this.personalID = personalID;
        this.nombre = nombre;
        this.contactoC = contactoC;
        this.telefono = telefono;
        this.correo = correo;
        this.datos = datos;
        this.direccion = direccion;
        this.estadoC = estadoC;
        this.genero = genero;
        this.fechaNac = fechaNac;
        this.nacionalidad = nacionalidad;
        this.rol = rol;
        this.uid = uid;
        this.esMedico = esMedico;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public Long getPersonalID() {
        return personalID;
    }

    public void setPersonalID(Long personalID) {
        this.personalID = personalID;
    }

    public String getContactoC() {
        return contactoC;
    }

    public void setContactoC(String contactoC) {
        this.contactoC = contactoC;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public boolean isDatos() {
        return datos;
    }

    public void setDatos(boolean datos) {
        this.datos = datos;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getEstadoC() {
        return estadoC;
    }

    public void setEstadoC(String estadoC) {
        this.estadoC = estadoC;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getNacionalidad() {
        return nacionalidad;
    }

    public void setNacionalidad(String nacionalidad) {
        this.nacionalidad = nacionalidad;
    }

    public char getRol() {
        return rol;
    }

    public void setRol(char rol) {
        this.rol = rol;
    }

    public Date getFechaNac() {
        return fechaNac;
    }

    public void setFechaNac(Date fechaNac) {
        this.fechaNac = fechaNac;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public boolean isEsMedico() {
        return esMedico;
    }

    public void setEsMedico(boolean esMedico) {
        this.esMedico = esMedico;
    }
}
