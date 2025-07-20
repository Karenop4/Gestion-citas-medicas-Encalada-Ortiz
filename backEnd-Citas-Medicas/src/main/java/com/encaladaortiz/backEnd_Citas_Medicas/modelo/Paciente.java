/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.encaladaortiz.backEnd_Citas_Medicas.modelo;
import java.util.ArrayList;
/**
 *
 * @author USER
 */
public class Paciente extends Usuario{
    String idPaciente;
    String tipoSangre;
    ArrayList<Cita> citas;

    public Paciente(String personaID) {
        super(personaID);
    }

 
    public String getTipoSangre() {
        return tipoSangre;
    }

    public ArrayList<Cita> getCitas() {
        return citas;
    }

    public String getIdPaciente() {
        return idPaciente;
    }

    public void setIdPaciente(String idPaciente) {
        this.idPaciente = idPaciente;
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
