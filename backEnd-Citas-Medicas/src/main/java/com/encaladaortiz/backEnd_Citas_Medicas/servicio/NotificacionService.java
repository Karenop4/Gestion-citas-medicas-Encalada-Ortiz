package com.encaladaortiz.backEnd_Citas_Medicas.servicio;

import com.encaladaortiz.backEnd_Citas_Medicas.modelo.Cita;
import com.encaladaortiz.backEnd_Citas_Medicas.repositorio.CitaRepository;
import com.twilio.Twilio;
import com.twilio.type.PhoneNumber;
import com.twilio.rest.api.v2010.account.Message;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Service
public class NotificacionService {


    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private JavaMailSender mailSender;

    private static final String TWILIO_SID = "AC1ceb1a26d6329fa18c8b86ebba3114dc";
    private static final String TWILIO_AUTH = "0fc94bd5be640a7d07bf6cd23d1b586a";
    private static final String TWILIO_NUMERO = "whatsapp:+14155238886"; // Twilio sandbox

    @Scheduled(cron = "0 02 21 * * *") // Todos los días a las 21:00
    @Transactional
    public void enviarRecordatorioUnDiaAntes() {
        LocalDate mañana = LocalDate.now().plusDays(1);
        List<Cita> citas = citaRepository.findByFechaBetween(mañana, mañana);

        for (Cita cita : citas) {
            enviarCorreo(cita, "Recordatorio de tu cita para mañana");
            enviarWhatsapp(cita, "Recordatorio de tu cita para mañana");
        }
    }

    @Scheduled(cron = "0 */5 * * * *") // Cada 5 minutos
    @Transactional
    public void enviarRecordatorioUnaHoraAntes() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime enUnaHora = ahora.plusHours(1).withSecond(0).withNano(0);

        List<Cita> todas = citaRepository.findAll(); // o solo las de hoy si tienes un método optimizado
        for (Cita cita : todas) {
            LocalDateTime citaDateTime = LocalDateTime.of(cita.getFecha(), cita.getHora());
            if (citaDateTime.equals(enUnaHora)) {
                enviarCorreo(cita, "Tu cita es en una hora");
                enviarWhatsapp(cita, "Tu cita es en una hora");
            }
        }
    }

    public void enviarCorreo(Cita cita, String mensajePersonalizado) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(cita.getPaciente().getCorreo());
        mensaje.setSubject("Recordatorio de Cita Médica");
        mensaje.setText("Hola " + cita.getPaciente().getNombre() + ",\n\n" +
                mensajePersonalizado + " (" +
                cita.getFecha() + " a las " +
                cita.getHora() + ").\n\n¡No faltes!");

        mailSender.send(mensaje);
    }

    public void enviarWhatsapp(Cita cita, String mensajePersonalizado) {
        Twilio.init(TWILIO_SID, TWILIO_AUTH);

        Message.creator(
                new PhoneNumber("whatsapp:" + cita.getPaciente().getTelefono()),
                new PhoneNumber(TWILIO_NUMERO),
                "Hola " + cita.getPaciente().getNombre() + ", " +
                        mensajePersonalizado + ": " +
                        cita.getFecha() + " a las " +
                        cita.getHora()
        ).create();
    }

    public void enviarNotificacionManual(Cita cita) {
        String mensaje = "Este es un recordatorio manual de tu cita médica";
        enviarCorreo(cita, mensaje);
        enviarWhatsapp(cita, mensaje);
    }
}
