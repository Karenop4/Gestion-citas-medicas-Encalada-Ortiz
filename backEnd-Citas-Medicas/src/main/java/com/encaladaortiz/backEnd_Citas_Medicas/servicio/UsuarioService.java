package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

// Ejemplo: com.encaladaortiz.backEnd_Citas_Medicas.servicio.UsuarioService.java
import com.encaladaortiz.backEnd_Citas_Medicas.DTO.EspecialidadDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.DTO.HorarioDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.DTO.UsuarioDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.*;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.UsuarioRepository; // Tu repositorio
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public UsuarioDTO findByFirebaseUid(String firebaseUid) {
        Usuario usuario = usuarioRepository.findByuid(firebaseUid).orElse(null);

        if (usuario != null) {
            return convertToDTO(usuario); // Convierte tu entidad a un DTO para enviar al frontend
        }
        return null;
    }

    // Método de ejemplo para convertir la entidad Usuario a un DTO para el frontend
    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();

        // Mapeo de todas las propiedades de la entidad Usuario al UsuarioDTO
        dto.setPersonalID(usuario.getPersonalID());
        dto.setCedula(usuario.getCedula());
        dto.setNombre(usuario.getNombre());
        dto.setContactoC(usuario.getContactoC());
        dto.setTelefono(usuario.getTelefono());
        dto.setCorreo(usuario.getCorreo());
        dto.setDatos(usuario.isDatos()); // Para booleanos, el getter suele ser 'isNombrePropiedad()'
        dto.setDireccion(usuario.getDireccion());
        dto.setEstadoC(usuario.getEstadoC());
        dto.setGenero(usuario.getGenero());
        dto.setNacionalidad(usuario.getNacionalidad());
        dto.setFechaNac(usuario.getFechaNac()); // Se pasa como java.util.Date
        dto.setRol(usuario.getRol());
        dto.setUid(usuario.getUid());
        dto.setEsMedico(usuario.isEsMedico()); // Para booleanos, el getter suele ser 'isEsMedico()'

        if (usuario instanceof Medico) {
            Medico medico = (Medico) usuario; // Casteo a Medico para acceder a sus propiedades
            if (medico.getEspecialidad() != null) {
                // Llama a un método auxiliar para convertir Especialidad a EspecialidadDTO
                dto.setEspecialidad(convertToEspecialidadDTO(medico.getEspecialidad()));
            }
            if (medico.getHorario() != null) {
                // Llama a un método auxiliar para convertir Horario a HorarioDTO
                dto.setHorario(convertToHorarioDTO(medico.getHorario()));
            }
        }

        // --- Mapeo Condicional para Paciente ---
        else if (usuario instanceof Paciente) { // Usar else if para que no intente ambas ramas si son excluyentes
            Paciente paciente = (Paciente) usuario; // Casteo a Paciente
            dto.setTipoSangre(paciente.getTipoSangre());
        }

        return dto;
    }

    private EspecialidadDTO convertToEspecialidadDTO(Especialidad especialidad) {
        if (especialidad == null) return null;
        EspecialidadDTO dto = new EspecialidadDTO();
        dto.setId(especialidad.getId());
        dto.setNombre(especialidad.getNombre());
        dto.setActiva(especialidad.isActiva()); // Asumiendo que Especialidad tiene un campo 'activa'
        return dto;
    }

    // Este método podría estar en un HorarioService o en un mapper común
    private HorarioDTO convertToHorarioDTO(Horario horario) {
        if (horario == null) return null;
        HorarioDTO dto = new HorarioDTO();
        dto.setId(horario.getId());
        dto.setDias(horario.getDias());
        dto.setHoraInicio(horario.getHoraInicio());
        dto.setHoraFin(horario.getHoraFin());
        return dto;
    }

    // Asegúrate de que tu UsuarioService también tenga un método para convertir Entidad Paciente a UsuarioDTO
    // (si es que la entidad Paciente es la que se recupera de la BD para un rol 'p')
    // Esto es lo que se usa en PacienteService.actualizar, etc.
    public UsuarioDTO convertToUsuarioDTO(Paciente paciente) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setPersonalID(paciente.getPersonalID());
        dto.setCedula(paciente.getCedula());
        dto.setNombre(paciente.getNombre());
        dto.setContactoC(paciente.getContactoC());
        dto.setTelefono(paciente.getTelefono());
        dto.setCorreo(paciente.getCorreo());
        dto.setDatos(paciente.isDatos());
        dto.setDireccion(paciente.getDireccion());
        dto.setEstadoC(paciente.getEstadoC());
        dto.setGenero(paciente.getGenero());
        dto.setNacionalidad(paciente.getNacionalidad());
        dto.setFechaNac(paciente.getFechaNac());
        dto.setRol(paciente.getRol());
        dto.setUid(paciente.getUid());
        dto.setEsMedico(paciente.isEsMedico());
        dto.setTipoSangre(paciente.getTipoSangre()); // ¡AGREGADO para Paciente!
        return dto;
    }
}