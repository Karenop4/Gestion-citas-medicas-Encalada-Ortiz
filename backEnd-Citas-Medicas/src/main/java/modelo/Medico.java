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
public class Medico {
    Especialidad especialidad;
    ArrayList<Cita> citas;
    Horario horario;

    public Medico(Especialidad especialidad) {
        this.especialidad = especialidad;
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
