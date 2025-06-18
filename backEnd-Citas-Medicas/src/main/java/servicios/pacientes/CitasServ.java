/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package servicios.pacientes;

import DAO.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;
import modelo.Cita;

/**
 *
 * @author USER
 */
public class CitasServ {
    //Logica del programa 
    //Toda validacion de la base se solicita al DAO, el cual tiene acceso a la base de datos
    private CitaDAO citaDAO;
    /*
    private MedicoDAO medicoDAO;
    private PacienteDAO pacienteDAO;
    private HorarioDAO horarioDAO; */

    public CitasServ(CitaDAO citaDAO/*, MedicoDAO medicoDAO, PacienteDAO pacienteDAO, HorarioDAO horarioDAO*/) {
        this.citaDAO = citaDAO;
        /*
        this.medicoDAO = medicoDAO;
        this.pacienteDAO = pacienteDAO;
        this.horarioDAO = horarioDAO;*/
    }

    public boolean agendarCita(String idPaciente, String idMedico, Date fecha, LocalTime hora, String nombre) {
        //Logica para agendar Citas
        return false;
    }

    public List<Cita> obtenerCitasPorMedico(String idMedico) {
        // Logica para Listar Citas
        return null;
    }
    public List<Cita> obtenerCitasPorPaciente(String idPaciente) {
        // Logica para Listar Citas
        return null;
    }
    public Cita obtenerCita(String citaID){
        //Logica para obtener una sola Cita
        return null;
    }
    public Cita actualizarCita(Cita cita, Date fecha, LocalTime hora){
        return null;
    }
    
    public boolean cancelarCita(String idCita, String motivoCancelacion){
        //Logica para cancelar Citas
        return false;
    }
    
    
}
