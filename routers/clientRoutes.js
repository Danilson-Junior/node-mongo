const { Router } = require('express');
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');

const router = Router();

router.get('/client', getAllClients);
router.get('/client/:id', getClientById);
router.post('/client', createClient);
router.put('/client/:id', updateClient);
router.delete('/client/:id', deleteClient);

module.exports = router;
