# Gestion de citas Médicas. 
Este proyecto presenta una simulación de un hospital, ofreciendo registros diferenciados por roles, para pacientes y administradores. Cada rol posee accesso a diferentes servicios, en el caso de pacientes se tiene acceso a Agendamiento de citas y Consulta de Citas, para los administradores se tienen todos los servicios del paciente, incluyendo servicios administrativos como son: Gestion de Horarios de Médicos, Gestión de citas de Médicos y Gestión de eespecialidades.

# Pacientes
•	Agendamiento de citas: El paciente ingresa a la sección de agendamiento y sigue los siguientes pasos.  
•	Primer paso: Selección de Especialidad  
	Estas especialidades son cargadas directamente de la colección “especialidades” en FireStore.  
•	Segundo paso: Selección de médico.  
	Los médicos disponibles cambian según la especialidad, cada médico pertenece a una sola especialidad.  
•	Tercer paso: Selección de fecha.  
  El usuario selecciona un día para su cita, esta fecha es validada según el horario de trabajo del médico, además, las citas solo pueden agendarse para dentro de 2 meses.  
  En caso de seleccionar una fecha que no esté disponible, en el paso 4 se mostrará el siguiente mensaje.  
•	Cuarto paso: Selección de hora.  
	En el caso de que la fecha seleccionada esté disponible, se mostrarán las horas disponibles, las cuales son validadas según el horario del médico y las citas confirmadas para el médico.  
•	Quinto paso: Confirmar la cita  
  En la siguiente ventana el usuario confirma la cita, esta cita aparecerá como pendiente en el sistema, por tanto, la hora seleccionada no se bloqueará para otras citas.  
•	Consulta de citas: El paciente ingresa a la sección de Consultas y aquí podrá ver todas las citas que ha agendado y su estado (Pendiente, Confirmada y Cancelada).  
  Además, en caso de ser médico se mostrarán las citas que tiene con pacientes (Solo se muestran citas confirmadas).  
  
# Administradores
•	Administración de Horarios de médicos.  
•	Elección de Médico: El administrador escoge el médico y se carga su horario. 
  Aquí el administrador podrá editar los días laborales, la hora de inicio de su jornada y su hora de salida. Estos cambios no presentarán conflictos con las citas que ya han sido confirmadas, esto queda a manos del mismo administrador, confirmar o no las citas pendientes después de la edición queda en sus manos.  
•	Administración de citas  
  El administrador ingresa en la sección Administración y selecciona un médico. 
•	Se cargan las citas con estado pendiente para el médico, con las opciones de cancelarlas o confirmarlas.   
  El estado que se le otorgue a esta cita se verá reflejada en la sección de Consultas.  
•	Administración de Especialidades  
  El administrador posee de un CRUD para especialidades.  
