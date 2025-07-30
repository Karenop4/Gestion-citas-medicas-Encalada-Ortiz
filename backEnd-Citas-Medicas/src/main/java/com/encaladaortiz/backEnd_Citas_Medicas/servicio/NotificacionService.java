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
    private static final String TWILIO_AUTH = "97ace6af380b62af34b894e9e09f58d4";
    private static final String TWILIO_NUMERO = "whatsapp:+14155238886"; // Twilio sandbox

    @Scheduled(cron = "0 0 8 * * *") // Todos los días a las 8 AM
    @Transactional
    public void enviarRecordatorios() {
        LocalDate inicio = LocalDate.now().plusDays(1);
        LocalDate fin = inicio; // Si solo te interesa un día, inicio y fin igual
        List<Cita> citas = citaRepository.findByFechaBetween(inicio, fin);

        for (Cita cita : citas) {
            enviarCorreo(cita);
            enviarWhatsapp(cita);
        }
    }

    public void enviarCorreo(Cita cita) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(cita.getPaciente().getCorreo());
        mensaje.setSubject("Recordatorio de Cita Médica");
        mensaje.setText("Hola " + cita.getPaciente().getNombre() + ",\n\n" +
                "Este es un recordatorio de tu cita para el " +
                cita.getFecha() + " a las " +
                cita.getHora() + ".\n\n¡No faltes!");

        mailSender.send(mensaje);
    }

    public void enviarWhatsapp(Cita cita) {
        Twilio.init(TWILIO_SID, TWILIO_AUTH);

        Message message = Message.creator(
                new PhoneNumber("whatsapp:" + cita.getPaciente().getTelefono()),
                new PhoneNumber(TWILIO_NUMERO),
                "Hola " + cita.getPaciente().getNombre() +
                        ", este es un recordatorio de tu cita para el " +
                        cita.getFecha() + " a las " +
                        cita.getHora()
        ).create();
    }
}
