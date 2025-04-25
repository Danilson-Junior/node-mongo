const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDateRange,
} = require('../controllers/appointmentController');

const router = Router();

router.use(authMiddleware);

router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.get('/filter', getAppointmentsByDateRange)

module.exports = router;
