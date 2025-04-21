const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const {
  loginUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = Router();

// A rota de login não deve ser protegida
router.post('/login', loginUser);

// A rota de criação de usuário também não deve ser protegida
router.post('/', createUser);

// Agora, aplica o middleware de autenticação nas rotas que requerem autenticação
router.use(authMiddleware); // Protege todas as rotas abaixo

router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
