package com.encaladaortiz.backEnd_Citas_Medicas.DTO;

public class EspecialidadDTO {
    private Long id;
    private String nombre;
    private Boolean activa;

    // Constructor
    public EspecialidadDTO(Long id, String nombre, Boolean activa) {
        this.id = id;
        this.nombre = nombre;
        this.activa = activa;
    }
    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
}