const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');


const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');


const router = Router();

router.use(authMiddleware); // protege todas as rotas abaixo

router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;
