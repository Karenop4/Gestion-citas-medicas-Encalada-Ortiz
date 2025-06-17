/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package modelo;

import java.util.Date;

/**
 *
 * @author USER
 */
public class Usuario {
    String personaID;
    String cedula;
    String nombre;
    String contactoE;
    String  telefono;
    String correo;
    boolean datos;
    String direccion;
    String estadoC;
    Date fechaNac;
    String genero;
    String nacionalidad;
    char rol;
//Constructores
    public Usuario(String personaID, String cedula, String nombre, String contactoE, String telefono, String correo, String direccion, String estadoC, Date fechaNac, String genero, String nacionalidad, char rol) {
        this.personaID = personaID;
        this.cedula = cedula;
        this.nombre = nombre;
        this.contactoE = contactoE;
        this.telefono = telefono;
        this.correo = correo;
        this.datos = true;
        this.direccion = direccion;
        this.estadoC = estadoC;
        this.fechaNac = fechaNac;
        this.genero = genero;
        this.nacionalidad = nacionalidad;
        this.rol = rol;
    }
    public Usuario(String personaID){
        this.personaID=personaID;
        this.datos=false;
    }
 //Getters y Setters

    public String getPersonaID() {
        return personaID;
    }

    public String getCedula() {
        return cedula;
    }

    public String getNombre() {
        return nombre;
    }

    public String getContactoE() {
        return contactoE;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public boolean isDatos() {
        return datos;
    }

    public String getDireccion() {
        return direccion;
    }

    public String getEstadoC() {
        return estadoC;
    }

    public Date getFechaNac() {
        return fechaNac;
    }

    public String getGenero() {
        return genero;
    }

    public String getNacionalidad() {
        return nacionalidad;
    }

    public char getRol() {
        return rol;
    }

    public void setPersonaID(String personaID) {
        this.personaID = personaID;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setContactoE(String contactoE) {
        this.contactoE = contactoE;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setDatos(boolean datos) {
        this.datos = datos;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public void setEstadoC(String estadoC) {
        this.estadoC = estadoC;
    }

    public void setFechaNac(Date fechaNac) {
        this.fechaNac = fechaNac;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public void setNacionalidad(String nacionalidad) {
        this.nacionalidad = nacionalidad;
    }

    public void setRol(char rol) {
        this.rol = rol;
    }

    @Override
    public String toString() {
        return "Usuario{" + "personaID=" + personaID + ", cedula=" + cedula + ", nombre=" + nombre + ", contactoE=" + contactoE + ", telefono=" + telefono + ", correo=" + correo + ", datos=" + datos + ", direccion=" + direccion + ", estadoC=" + estadoC + ", fechaNac=" + fechaNac + ", genero=" + genero + ", nacionalidad=" + nacionalidad + ", rol=" + rol + '}';
    }
    
    
    
}
