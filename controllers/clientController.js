const Client = require('../models/clientModel');
const Appointment = require('../models/appointmentModel');

// Função de validação de dados do cliente
// Verifica se os campos obrigatórios (nome, telefone e CPF) estão preenchidos
function validateClientData({ name, phone, cpf }) {
  if (!name || !phone || !cpf) {
    return 'Preencha todos os campos obrigatórios'; // Retorna erro se algum campo obrigatório estiver faltando
  }
  return null; // Se os campos estiverem completos, retorna null (sem erro)
}

// Função de validação de CPF único
// Verifica se já existe um cliente com o mesmo CPF registrado para o mesmo usuário
async function checkIfCpfExists(cpf, userId) {
  const existingClient = await Client.findOne({ cpf, user: userId }); // Busca cliente pelo CPF e ID do usuário
  if (existingClient) {
    return 'CPF já cadastrado para este usuário'; // Retorna erro caso o CPF já exista
  }
  return null; // Se o CPF for único, retorna null
}

// Buscar todos os clientes do usuário logado
const getAllClients = async (req, res) => {
  try {
    // Busca todos os clientes pertencentes ao usuário logado (usando o ID do usuário)
    const clients = await Client.find({ user: req.user.id });
    return res.status(200).json({
      success: true,
      message: 'Clientes encontrados com sucesso', // Mensagem de sucesso
      data: clients, // Retorna a lista de clientes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar clientes', // Mensagem de erro caso ocorra uma falha na busca
      error: error.message, // Detalhes do erro
    });
  }
};

// Buscar um cliente específico pelo ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params; // Obtém o ID do cliente da URL
    // Busca o cliente com o ID fornecido e verifica se pertence ao usuário logado (usando o ID do usuário)
    const client = await Client.findOne({ _id: id, user: req.user.id }).populate('appointments');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado', // Mensagem de erro caso o cliente não seja encontrado
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cliente encontrado com sucesso', // Mensagem de sucesso
      data: client, // Retorna os dados do cliente encontrado
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente', // Mensagem de erro caso ocorra uma falha na busca
      error: error.message, // Detalhes do erro
    });
  }
};

// Criar um novo cliente
const createClient = async (req, res) => {
  try {
    // 1. Validação dos dados obrigatórios do cliente
    const validationError = validateClientData(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError }); // Retorna erro se dados estiverem inválidos
    }

    // 2. Verificação de CPF duplicado para o usuário
    const cpfError = await checkIfCpfExists(req.body.cpf, req.user.id);
    if (cpfError) {
      return res.status(409).json({ success: false, message: cpfError }); // Retorna erro se CPF já estiver cadastrado
    }

    // 3. Criação do novo cliente
    const { name, phone, cpf } = req.body; // Extrai os dados enviados para o cliente
    const newClient = new Client({
      name,
      phone,
      cpf,
      user: req.user.id, // Associa o cliente ao usuário logado
    });

    const savedClient = await newClient.save(); // Salva o cliente no banco de dados

    // 4. Resposta de sucesso com o cliente criado
    return res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso', // Mensagem de sucesso
      data: savedClient, // Dados do cliente recém-criado
    });
  } catch (error) {
    // 5. Tratamento de erro
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar cliente', // Mensagem de erro caso ocorra falha na criação
      error: error.message, // Detalhes do erro
    });
  }
};

// Atualizar os dados de um cliente existente
const updateClient = async (req, res) => {
  try {
    const { id } = req.params; // Obtém o ID do cliente da URL
    const { name, phone } = req.body; // Extrai os dados atualizados do cliente

    // 1. Validação dos dados obrigatórios
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Nome e telefone são obrigatórios' }); // Retorna erro se faltar nome ou telefone
    }

    // 2. Verificação se o cliente existe
    const client = await Client.findOne({ _id: id, user: req.user.id });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado' }); // Retorna erro se o cliente não for encontrado
    }

    // 3. Atualiza os dados do cliente
    client.name = name;
    client.phone = phone;

    const updatedClient = await client.save(); // Salva as alterações no cliente

    // 4. Resposta de sucesso com o cliente atualizado
    return res.status(200).json({
      success: true,
      message: 'Cliente atualizado com sucesso', // Mensagem de sucesso
      data: updatedClient, // Dados do cliente atualizado
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente', // Mensagem de erro caso ocorra falha na atualização
      error: error.message, // Detalhes do erro
    });
  }
};

// Deletar um cliente e seus agendamentos
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params; // Obtém o ID do cliente da URL

    // Encontra o cliente pelo ID e verifica se pertence ao usuário logado
    const client = await Client.findOne({ _id: id, user: req.user.id });
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' }); // Retorna erro caso o cliente não seja encontrado
    }

    // 1. Apaga todos os agendamentos associados ao cliente
    await Appointment.deleteMany({ client: client._id }); // Deleta todos os agendamentos relacionados ao cliente

    // 2. Apaga o cliente do banco de dados
    await Client.findByIdAndDelete(id); // Deleta o cliente pelo ID

    // 3. Resposta de sucesso após exclusão
    res.json({ message: 'Cliente e seus agendamentos foram excluídos com sucesso' }); // Mensagem de sucesso
  } catch (error) {
    // 4. Tratamento de erro caso ocorra falha na exclusão
    res.status(500).json({ message: 'Erro ao excluir cliente', error: error.message }); // Detalhes do erro
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
