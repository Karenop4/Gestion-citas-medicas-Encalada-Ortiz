/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package modelo;
import java.util.ArrayList;
/**
 *
 * @author USER
 */
public class Paciente {
    String tipoSangre;
    ArrayList<Cita> citas;

    public Paciente(String tipoSangre) {
        this.tipoSangre = tipoSangre;
    }

    public String getTipoSangre() {
        return tipoSangre;
    }

    public ArrayList<Cita> getCitas() {
        return citas;
    }

    public void setTipoSangre(String tipoSangre) {
        this.tipoSangre = tipoSangre;
    }

    public void setCitas(ArrayList<Cita> citas) {
        this.citas = citas;
    }

    @Override
    public String toString() {
        return "Paciente{" + "tipoSangre=" + tipoSangre + ", citas=" + citas + '}';
    }
    
}
