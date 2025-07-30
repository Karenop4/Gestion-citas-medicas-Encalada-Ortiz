package com.encaladaortiz.backEnd_Citas_Medicas.DTO;

import java.time.LocalTime;

public class HorarioDTO {
    private Long id;
    private boolean descanso;
    private String dias; // Se mantiene como String "1,2,3,4,5"
    private LocalTime horaDescanso;
    private LocalTime horaFin;
    private LocalTime horaInicio;

    // Constructor vacío
    public HorarioDTO() {}

    // Constructor con todos los campos (opcional, para conveniencia)
    public HorarioDTO(Long id, boolean descanso, String dias, LocalTime horaDescanso, LocalTime horaFin, LocalTime horaInicio) {
        this.id = id;
        this.descanso = descanso;
        this.dias = dias;
        this.horaDescanso = horaDescanso;
        this.horaFin = horaFin;
        this.horaInicio = horaInicio;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public boolean isDescanso() { return descanso; }
    public void setDescanso(boolean descanso) { this.descanso = descanso; }
    public String getDias() { return dias; }
    public void setDias(String dias) { this.dias = dias; }
    public LocalTime getHoraDescanso() { return horaDescanso; }
    public void setHoraDescanso(LocalTime horaDescanso) { this.horaDescanso = horaDescanso; }
    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
}
