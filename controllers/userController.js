const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Valida os dados obrigatórios do corpo da requisição
function validateUserData({ name, email, password }) {
  if (!name || !email || !password) return 'Preencha todos os campos obrigatórios';
  return null;
}

// Verifica se já existe um usuário com o e-mail informado
async function checkIfEmailExists(email) {
  const existingUser = await User.findOne({ email });
  if (existingUser) return 'Email já cadastrado';
  return null;
}

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Garante que o usuário só veja os próprios dados
    if (id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const validationError = validateUserData(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const emailError = await checkIfEmailExists(email);
    if (emailError) return res.status(409).json({ message: emailError });

    // Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    // Remove a senha da resposta
    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({ message: 'Usuário criado com sucesso', user: userWithoutPassword });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Erro de validação', errors: validationErrors });
    }

    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    // Bloqueia atualização de outro usuário
    if (id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    // Atualiza e-mail se for diferente e ainda não estiver em uso
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(409).json({ message: 'E-mail já em uso' });
      user.email = email;
    }

    // Atualiza senha se enviada
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    const userWithoutPassword = updatedUser.toObject();
    delete userWithoutPassword.password;

    res.json({ message: 'Usuário atualizado com sucesso', user: userWithoutPassword });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Erro de validação', errors: validationErrors });
    }

    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Impede que o usuário exclua outra conta
    if (id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({ message: 'Usuário excluído com sucesso.', user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir o usuário.', error: error.message });
  }
};

module.exports = {
  loginUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
