const { Router } = require('express');
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');

const router = Router();

// Listar todos os agendamentos
router.get('/appointment', getAllAppointments);

// Buscar um agendamento por ID
router.get('/appointment/:id', getAppointmentById);

// Criar um novo agendamento
router.post('/appointment', createAppointment);

// Atualizar um agendamento
router.put('/appointment/:id', updateAppointment);

// Excluir um agendamento
router.delete('/appointment/:id', deleteAppointment);

module.exports = router;
