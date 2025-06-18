/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package controlador;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;
import modelo.Cita;
import modelo.Medico;
import modelo.Paciente;
import servicios.pacientes.CitasServ;
/**
 *
 * @author USER
 */
public class CitaC {
    private CitasServ ServicioC;
    private Paciente paciente;
    private Medico medico;
    public boolean agendarCita(String idPaciente, String idMedico, Date fecha, LocalTime hora, String nombre){
        return ServicioC.agendarCita(idPaciente, idMedico, fecha, hora, nombre);
    }
    public Cita actualizarCita(Cita cita, Date fecha, LocalTime hora){
        return ServicioC.actualizarCita(cita, fecha, hora);
    }
    public boolean cancelarCita(String idCita, String motivo){
        return ServicioC.cancelarCita(idCita, motivo);
    }
    public List<Cita> obtenerCitasPorMedico() {
        return ServicioC.obtenerCitasPorMedico(medico.getMedicoID());
    }
    public List<Cita> obtenerCitasPorPaciente(String idPaciente) {
        return ServicioC.obtenerCitasPorPaciente(paciente.getIdPaciente());
    }
    public Cita obtenerCita(String citaID){
        return ServicioC.obtenerCita(citaID);
    }
}
