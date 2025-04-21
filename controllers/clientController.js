const Client = require('../models/clientModel');

// Buscar todos os clientes
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({user: req.user.id});
    res.json(clients);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro ao buscar clientes', error: error.message });
  }
};

// Buscar um cliente pelo ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({_id: id, user: req.user.id}).populate('appointments'); // Populando os appointments

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro ao buscar cliente', error: error.message });
  }
};

// Criar cliente
const createClient = async (req, res) => {
  try {
    const { name, phone, cpf } = req.body;
    if (!name || !phone || !cpf) {
      return res
        .status(400)
        .json({ message: 'Preencha todos os campos obrigatórios' });
    }

    const existingClient = await Client.findOne({ cpf, user: req.user.id });
    if (existingClient) {
      return res.status(409).json({ message: 'CPF já cadastrado' });
    }

    const newClient = new Client({ name, phone, cpf, user: req.user.id });
    const savedClient = await newClient.save();

    res.status(201).json(savedClient);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro ao criar cliente', error: error.message });
  }
};

// Atualizar cliente
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res
        .status(400)
        .json({ message: 'Preencha nome e telefone para atualizar' });
    }

    const client = await Client.findOne({_id: id, user: req.user.id});

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Atualiza nome e telefone
    client.name = name;
    client.phone = phone;

    const updatedClient = await client.save();

    res.json({
      message: 'Cliente atualizado com sucesso',
      client: updatedClient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
};

// Deletar cliente
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClient = await Client.findOneAndDelete({_id: id, user: req.user.id});

    if (!deletedClient) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro ao deletar cliente', error: error.message });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
