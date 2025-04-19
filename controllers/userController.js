const bcrypt = require('bcryptjs'); // Em vez de bcrypt
const User = require('../models/userModel');

// Buscar todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro ao buscar usuários', error: error.message });
  }
};

// Buscar um usuário pelo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro ao buscar usuário', error: error.message });
  }
};

// Criar um novo usuário
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Preencha todos os campos obrigatórios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const newUser = new User({ name, email, password });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message,
      );
      return res
        .status(400)
        .json({ message: 'Erro de validação', errors: validationErrors });
    }

    res
      .status(500)
      .json({ message: 'Erro ao criar usuário', error: error.message });
  }
};

// Atualizar informações de um usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    // Procurando o usuário pelo ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificando e atualizando o e-mail, se necessário
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });

      // Se o novo e-mail já estiver em uso
      if (emailExists) {
        return res
          .status(409)
          .json({ message: 'E-mail já está em uso por outro usuário' });
      }

      // Caso o e-mail não exista, faz a atualização
      user.email = email;
    }

    // Verificando e atualizando a senha, se necessário
    if (password) {
      // Criptografando a nova senha antes de salvar
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Salvando o usuário atualizado
    const updatedUser = await user.save();

    // Retornando a resposta com o usuário atualizado (sem a senha)
    res.json({ message: 'Usuário atualizado com sucesso', user: updatedUser });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message,
      );
      return res
        .status(400)
        .json({ message: 'Erro de validação', errors: validationErrors });
    }

    res
      .status(500)
      .json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
};

// Excluir um usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário excluído com sucesso.', user: deletedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro ao excluir o usuário.', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
