const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe
    const user = await User.findOne({ email }).select('+password'); // Inclui a senha, pois você a ocultou no schema

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    // Compara a senha fornecida com a armazenada no banco
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Cria o token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Retorna o token e o nome do usuário
    return res.status(200).json({ token, name: user.name });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};



// Buscar um usuário pelo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar esses dados' });
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
};

// Criar um novo usuário
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    // Criptografando a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    res.status(201).json({ message: 'Usuário criado com sucesso', user: savedUser });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Erro de validação', errors: validationErrors });
    }

    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
};

// Atualizar informações de um usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

     // Verifica se o usuário autenticado é o mesmo que está tentando atualizar os dados
     if (id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Você não tem permissão para atualizar esses dados' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(409).json({ message: 'E-mail já está em uso por outro usuário' });
      }

      user.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({ message: 'Usuário atualizado com sucesso', user: updatedUser });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Erro de validação', errors: validationErrors });
    }

    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
};

// Excluir um usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir sua conta' });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

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
