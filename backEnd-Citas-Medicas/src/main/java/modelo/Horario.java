/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package modelo;

/**
 *
 * @author USER
 */
public class Horario {
    String dias;
    String horaInicio;
    String horaFin;
    boolean descanso;
    String horaDescanso;

    public Horario(String dias, String horaInicio, String horaFin, boolean descanso, String horaDescanso) {
        this.dias = dias;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.descanso = descanso;
        this.horaDescanso = horaDescanso;
    }

    public String getDias() {
        return dias;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public String getHoraFin() {
        return horaFin;
    }

    public boolean isDescanso() {
        return descanso;
    }

    public String getHoraDescanso() {
        return horaDescanso;
    }

    public void setDias(String dias) {
        this.dias = dias;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }

    public void setDescanso(boolean descanso) {
        this.descanso = descanso;
    }

    public void setHoraDescanso(String horaDescanso) {
        this.horaDescanso = horaDescanso;
    }

    @Override
    public String toString() {
        return "Horario{" + "dias=" + dias + ", horaInicio=" + horaInicio + ", horaFin=" + horaFin + ", descanso=" + descanso + ", horaDescanso=" + horaDescanso + '}';
    }
    
    
}
