const express = require('express');
const router = express.Router();
const { getAppointmentsByDateRange } = require('../controllers/appointmentController');

// Middleware fake que simula um usuário logado
router.use((req, res, next) => {
  req.user = {
    id: '6806be7df0953af830267559' // Substitua pelo ID do seu usuário de teste
         
  };
  next();
});

// Rota de teste
router.get('/appointments-test', getAppointmentsByDateRange);

module.exports = router;
