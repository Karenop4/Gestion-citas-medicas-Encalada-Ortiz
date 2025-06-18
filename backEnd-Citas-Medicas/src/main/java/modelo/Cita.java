/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package modelo;

import java.time.LocalTime;
import java.util.Date;

/**
 *
 * @author USER
 */
public class Cita {
   String citaID;
   Date fecha; 
   LocalTime hora;
   char estado; //'p' pendiente ,'x' cancelada o 'c' confirmada
   String nombre;

    public Cita(Date fecha, LocalTime hora, String nombre) {
        this.fecha = fecha;
        this.hora = hora;
        this.nombre = nombre;
        this.estado='p';
    }

    public Date getFecha() {
        return fecha;
    }

    public LocalTime getHora() {
        return hora;
    }

    public char getEstado() {
        return estado;
    }

    public String getNombre() {
        return nombre;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public void setHora(LocalTime hora) {
        this.hora = hora;
    }

    public void setEstado(char estado) {
        this.estado = estado;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public String toString() {
        return "Cita{" + "fecha=" + fecha + ", hora=" + hora + ", estado=" + estado + ", nombre=" + nombre + '}';
    }
   
   
}
