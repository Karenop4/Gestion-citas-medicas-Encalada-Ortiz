package com.encaladaortiz.backEnd_Citas_Medicas.DTO;
public class MedicoDTO {
    private Long id;
    private String nombre;
    private String cedula;
    private String especialidadNombre;

    public MedicoDTO(Long id, String nombre, String cedula, String especialidadNombre) {
        this.id = id;
        this.nombre = nombre;
        this.cedula = cedula;
        this.especialidadNombre = especialidadNombre;
    }
    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }

    public String getEspecialidadNombre() { return especialidadNombre; }
    public void setEspecialidadNombre(String especialidadNombre) { this.especialidadNombre = especialidadNombre; }
}