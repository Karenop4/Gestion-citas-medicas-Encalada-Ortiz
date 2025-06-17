/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DAOI;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Date;
import modelo.Cita;
/**
 *
 * @author USER
 */
public interface CitaDAOI {
    boolean crearCita(Date fecha, LocalTime hora, String nombre);
    Cita obtenercita(Date fecha, LocalTime hora);
    ArrayList<Cita> listarCitas(String nombre);
    boolean actualizarCita(Date fecha, LocalTime hora);
    boolean cancelarCita(String nombre);
}
