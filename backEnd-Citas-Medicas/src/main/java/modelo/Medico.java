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
public class Medico extends Usuario{
    String medicoID;
    Especialidad especialidad;
    ArrayList<Cita> citas;
    Horario horario;

    public Medico(String personaID) {
        super(personaID);
    }

    public Especialidad getEspecialidad() {
        return especialidad;
    }

    public ArrayList<Cita> getCitas() {
        return citas;
    }

    public Horario getHorario() {
        return horario;
    }

    public String getMedicoID() {
        return medicoID;
    }

    public void setMedicoID(String medicoID) {
        this.medicoID = medicoID;
    }
    
    
    public void setEspecialidad(Especialidad especialidad) {
        this.especialidad = especialidad;
    }

    public void setCitas(ArrayList<Cita> citas) {
        this.citas = citas;
    }

    public void setHorario(Horario horario) {
        this.horario = horario;
    }

    @Override
    public String toString() {
        return "Medico{" + "especialidad=" + especialidad + ", citas=" + citas + ", horario=" + horario + '}';
    }
    
    
}
