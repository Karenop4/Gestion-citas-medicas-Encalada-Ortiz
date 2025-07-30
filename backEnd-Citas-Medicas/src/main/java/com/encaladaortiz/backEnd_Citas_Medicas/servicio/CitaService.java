package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.DTO.CitaDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.DTO.EspecialidadDTO;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Especialidad;
import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Medico;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.CitaRepository;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.EspecialidadRepository;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.MedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate; // ¡Importante!
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.layout.properties.TextAlignment;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.constants.StandardFonts; // Para fuentes estándar como Helvetica

@Service
public class CitaService {

    private final CitaRepository repository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private EspecialidadRepository especialidadRepository; // ¡Nuevo: inyectar EspecialidadRepository!

    public CitaService(CitaRepository repository) {
        this.repository = repository;
    }

    public List<Cita> listar() {
        return repository.findAll();
    }

    public List<CitaDTO> listarporMedico(Long medicoID) {
        List<Cita> citas = repository.findByEstado('p');
        return ObtenerCitasDTO(medicoID, citas);
    }
    public List<CitaDTO> citasConfirmadasPorMedico(Long medicoID) {
        List<Cita> citas = repository.findByEstado('c');
        return ObtenerCitasDTO(medicoID, citas);
    }

    private List<CitaDTO> ObtenerCitasDTO(Long medicoID, List<Cita> citas) {
        List<CitaDTO> citasDTO = new ArrayList<>();
        for (Cita cita : citas) {
            Long medicoID2 = cita.getMedico().getPersonalID();
            if (medicoID2.equals(medicoID)) {
                CitaDTO citaDTO=this.convertirADTO(cita);
                citasDTO.add(citaDTO);
            }
        }
        return citasDTO;
    }

    public List<CitaDTO> listarporPaciente(Long pacienteID) {
        List<Cita> citas = repository.findByEstado('p');
        List<CitaDTO> citasDTO = new ArrayList<>();
        for (Cita cita : citas) {
            Long pacienteID2 = cita.getPaciente().getPersonalID();
            if (pacienteID2.equals(pacienteID)) {
                CitaDTO citaDTO=this.convertirADTO(cita);
                citasDTO.add(citaDTO);
            }
        }
        return citasDTO;
    }

    public List<CitaDTO> listarporEspecialidad(Long especialidadID) {
        return obtenerCitasDTOEspecialidad(especialidadID);
    }
    public List<CitaDTO> citasConfirmadasPorEspecialidad(Long especialidadID) {
        return obtenerCitasDTOEspecialidad(especialidadID);
    }

    private List<CitaDTO> obtenerCitasDTOEspecialidad(Long especialidadID) {
        List<Cita> citas = repository.findAll();
        List<CitaDTO> citasDTO = new ArrayList<>();
        for (Cita cita : citas) {
            Long especialidadID2 = cita.getEspecialidad().getId();
            if (especialidadID2.equals(especialidadID)) {
                CitaDTO citaDTO=this.convertirADTO(cita);
                citasDTO.add(citaDTO);
            }
        }
        return citasDTO;
    }


    public CitaDTO convertirADTO(Cita cita) {
        CitaDTO dto = new CitaDTO();
        dto.setId(cita.getId());
        dto.setPaciente(cita.getPaciente().getNombre());
        dto.setFecha(cita.getFecha());
        dto.setHora(cita.getHora());
        dto.setEstado(cita.getEstado());
        dto.setMedico(cita.getMedico().getNombre()); // Asumiendo que CitaDTO tiene este campo
        dto.setEspecialidad(cita.getEspecialidad().getNombre()); // Asumiendo que CitaDTO tiene este campo
        dto.setMedico(cita.getMedico().getNombre()); // Asumiendo que CitaDTO tiene este campo
        return dto;
    }
    public Cita guardar(Cita cita) {
        return repository.save(cita);
    }

    public Optional<Cita> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
    public void cancelar(Long id) {
        repository.deleteById(id);
    }

    public Cita actualizar(Long id, Cita nueva) {
        return repository.findById(id).map(c -> {
            c.setFecha(nueva.getFecha());
            c.setHora(nueva.getHora());
            c.setEstado(nueva.getEstado());
            c.setPaciente(nueva.getPaciente());
            c.setMedico(nueva.getMedico());
            return repository.save(c);
        }).orElse(null);
    }


    public byte[] generarReporteCitasConfirmadasPorMedicoPdf(Long medicoId) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // Obtener el nombre del médico para el título
        Optional<Medico> medicoOptional = medicoRepository.findById(medicoId);
        String nombreMedico = medicoOptional.map(Medico::getNombre).orElse("Médico Desconocido");

        // Obtener solo las citas confirmadas para este médico
        List<CitaDTO> citasConfirmadas = citasConfirmadasPorMedico(medicoId); // Reutilizamos el método existente

        // --- Contenido del PDF ---

        // Título del reporte
        Paragraph title = new Paragraph("Reporte de Citas Confirmadas")
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Subtítulo con nombre del médico
        Paragraph subtitleMedico = new Paragraph("Dr. " + nombreMedico)
                .setFontSize(16)
                .setMarginBottom(15)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(subtitleMedico);


        // Información si no hay citas
        if (citasConfirmadas.isEmpty()) {
            document.add(new Paragraph("No hay citas confirmadas para este médico.")
                    .setTextAlignment(TextAlignment.CENTER));
        } else {
            // Tabla de citas
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2, 2, 2, 2})) // 5 columnas: ID, Paciente, Fecha, Hora, Especialidad
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(20);

            // Encabezados de la tabla
            table.addHeaderCell(createCell("ID"));
            table.addHeaderCell(createCell("Paciente"));
            table.addHeaderCell(createCell("Fecha"));
            table.addHeaderCell(createCell("Hora"));
            table.addHeaderCell(createCell("Especialidad")); // Añadimos la especialidad aquí

            // Filas de datos
            for (CitaDTO cita : citasConfirmadas) {
                table.addCell(createCell(String.valueOf(cita.getId())));
                table.addCell(createCell(cita.getPaciente()));
                table.addCell(createCell(cita.getFecha().toLocalDate().format(dateFormatter)));
                table.addCell(createCell(cita.getHora().format(timeFormatter)));
                table.addCell(createCell(cita.getEspecialidad())); // Asumiendo que cita.getEspecialidad() ya trae el nombre
            }
            document.add(table);
        }

        document.close();
        return baos.toByteArray();
    }
    /**
     * Obtiene todas las citas confirmadas para un médico en un rango de fechas.
     * @param fechaInicio Fecha de inicio del rango (inclusive).
     * @param fechaFin Fecha de fin del rango (inclusive).
     * @return Una lista de CitaDTOs.
     */
    public List<CitaDTO> getCitasConfirmadasMedicoEnRango(Long medicoPersonalId, LocalDate fechaInicio, LocalDate fechaFin) {
        // Asegúrate que el 'estado' sea 'p' (Character) como corregimos antes
        char estadoChar = 'p';

        // Convertir LocalDate a LocalDateTime para el rango
        LocalDateTime startDateTime = fechaInicio.atStartOfDay(); // Inicio del día (00:00:00)
        LocalDateTime endDateTime = fechaFin.atTime(23, 59, 59); // Final del día (23:59:59)

        List<Cita> citas = repository.findByMedicoPersonalIDAndEstadoAndFechaBetween(
                medicoPersonalId,
                estadoChar,
                startDateTime,
                endDateTime
        );
        List<CitaDTO> citasDTO=new ArrayList<>();

        for (Cita cita : citas) {
            CitaDTO citaDTO=new CitaDTO();
            citaDTO = this.convertirADTO(cita);
            citasDTO.add(citaDTO);
        }
        return citasDTO;
    }

    /**
     * Genera un reporte PDF de las citas CONFIRMADAS para una especialidad específica.
     *
     * @param especialidadId El ID de la especialidad.
     * @return Un array de bytes que representa el contenido del archivo PDF.
     * @throws Exception Si ocurre un error durante la generación del PDF.
     */
    public byte[] generarReporteCitasConfirmadasPorEspecialidadPdf(Long especialidadId) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // Obtener el nombre de la especialidad para el título
        Optional<Especialidad> especialidadO = especialidadRepository.findById(especialidadId);
        String nombreEspecialidad;
        if (especialidadO.isPresent()){
            nombreEspecialidad=especialidadO.get().getNombre();
        }
        else{
            nombreEspecialidad="Especialidad Desconocida";
        }


        // Obtener solo las citas confirmadas para esta especialidad
        List<CitaDTO> citasConfirmadas = citasConfirmadasPorEspecialidad(especialidadId); // Reutilizamos el método existente

        // --- Contenido del PDF ---

        // Título del reporte
        Paragraph title = new Paragraph("Reporte de Citas Confirmadas")
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Subtítulo con nombre de la especialidad
        Paragraph subtitleEspecialidad = new Paragraph("Especialidad: " + nombreEspecialidad)
                .setFontSize(16)
                .setMarginBottom(15)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(subtitleEspecialidad);

        // Información si no hay citas
        if (citasConfirmadas.isEmpty()) {
            document.add(new Paragraph("No hay citas confirmadas para esta especialidad.")
                    .setTextAlignment(TextAlignment.CENTER));
        } else {
            // Tabla de citas
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2, 2, 2, 2})) // 5 columnas: ID, Paciente, Médico, Fecha, Hora
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(20);

            // Encabezados de la tabla
            table.addHeaderCell(createCell("ID"));
            table.addHeaderCell(createCell("Paciente"));
            table.addHeaderCell(createCell("Médico")); // Añadimos el médico aquí
            table.addHeaderCell(createCell("Fecha"));
            table.addHeaderCell(createCell("Hora"));

            // Filas de datos
            for (CitaDTO cita : citasConfirmadas) {
                table.addCell(createCell(String.valueOf(cita.getId())));
                table.addCell(createCell(cita.getPaciente()));
                table.addCell(createCell(cita.getMedico())); // Asumiendo que cita.getMedico() ya trae el nombre
                table.addCell(createCell(cita.getFecha().toLocalDate().format(dateFormatter)));
                table.addCell(createCell(cita.getHora().format(timeFormatter)));
            }
            document.add(table);
        }

        document.close();
        return baos.toByteArray();
    }

    // Método auxiliar para crear celdas de tabla con estilo básico
    private com.itextpdf.layout.element.Cell createCell(String content) {
        return new com.itextpdf.layout.element.Cell()
                .add(new Paragraph(content))
                .setPadding(5)
                .setBorder(Border.NO_BORDER); // Puedes añadir bordes si los prefieres
    }

}
