const Appointment = require('../models/appointmentModel');
const Client = require('../models/clientModel');

/**
 * Função utilitária para verificar conflitos de agendamento.
 * Verifica se há outro agendamento que se sobrepõe ao novo intervalo de tempo desejado.
 * 
 * Parâmetros:
 * - startDate: data e hora de início do novo agendamento.
 * - endDate: data e hora de término do novo agendamento.
 * - userId: ID do usuário que está criando ou atualizando o agendamento.
 * - excludeAppointmentId: ID do agendamento a ser excluído da verificação de conflito (usado durante atualização).
 * 
 * Retorno: Retorna o primeiro agendamento em conflito ou null caso não haja conflito.
 */
async function checkAppointmentConflict(startDate, endDate, userId, excludeAppointmentId = null) {
  const conflictQuery = {
    startDate: { $lt: new Date(endDate) }, // O agendamento começa antes do novo término
    endDate: { $gt: new Date(startDate) }, // O agendamento termina depois do novo início
    user: userId, // Garantir que o conflito seja dentro do mesmo usuário
  };

  // Se estivermos atualizando um agendamento, ignoramos ele na verificação
  if (excludeAppointmentId) {
    conflictQuery._id = { $ne: excludeAppointmentId };
  }

  // Retorna o primeiro agendamento que causar conflito, populado com dados do cliente
  const conflict = await Appointment.findOne(conflictQuery).populate('client', 'name phone cpf');
  return conflict;
}

/**
 * Função de validação de agendamento.
 * Verifica se os dados de entrada são válidos, como a data de início ser anterior à data de término.
 * 
 * Parâmetros:
 * - clientName: nome do cliente.
 * - startDate: data de início do agendamento.
 * - endDate: data de término do agendamento.
 * 
 * Retorno: Retorna uma mensagem de erro caso algum campo não seja válido, ou null se tudo estiver correto.
 */
function validateAppointmentData({ clientName, startDate, endDate }) {
  if (!clientName || !startDate || !endDate) {
    return 'Todos os campos obrigatórios devem ser preenchidos';
  }

  // Verifica se a data de início é anterior à data de término
  if (new Date(startDate) >= new Date(endDate)) {
    return 'A data de início deve ser anterior à data de término.';
  }

  return null;
}

const getAppointmentsByDateRange = async (req, res) => {
  try {
    // 1. Pega as datas da URL
    const { start, end } = req.query;

    // 2. Verificação simples das datas
    if (!start || !end) {
      return res.status(400).json({ error: 'Parâmetros "start" e "end" são obrigatórios' });
    }

    // 3. Conversão para Date
    const startDate = new Date(start);
    const endDate = new Date(end);

    // 4. Busca TODOS os campos dos agendamentos e do cliente
    const appointments = await Appointment.find({
      user: req.user.id,
      startDate: { $lt: endDate },  // Agendamentos que começam antes do fim do período
      endDate: { $gt: startDate }    // E terminam depois do início do período
    })
    .populate('client'); // Sem parâmetros = retorna TODOS os campos do cliente

    // 5. Retorna todos os dados
    res.json(appointments);

  } catch (err) {
    res.status(500).json({ 
      error: 'Erro ao buscar agendamentos', err,
    });
  }
};

/**
 * Cria um novo agendamento.
 * 
 * Esta função valida os dados do agendamento, verifica se o cliente existe, se o horário não conflita com outro agendamento
 * e, caso tudo esteja certo, cria um novo agendamento.
 * 
 * Retorno: Retorna o agendamento criado com sucesso ou um erro caso algo tenha dado errado.
 */
const createAppointment = async (req, res) => {
  try {
    const { clientName, startDate, endDate, service, price, paymentMethod, observations } = req.body;

    // Validação dos dados do agendamento
    const validationError = validateAppointmentData(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Verifica se o cliente existe para o usuário logado
    const client = await Client.findOne({ name: clientName, user: req.user.id });
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Verifica se já existe um agendamento no mesmo intervalo de tempo
    const conflict = await checkAppointmentConflict(startDate, endDate, req.user.id);
    if (conflict) {
      return res.status(400).json({
        message: `Já existe um agendamento para ${conflict.client.name} entre ${new Date(conflict.startDate).toLocaleTimeString()} e ${new Date(conflict.endDate).toLocaleTimeString()}.`,
        conflictAppointment: conflict
      });
    }

    // Cria e salva o novo agendamento
    const newAppointment = new Appointment({
      user: req.user.id,
      client: client._id,
      startDate,
      endDate,
      service,
      price,
      paymentMethod,
      observations,
    });

    const savedAppointment = await newAppointment.save();

    // Associa o agendamento ao cliente
    client.appointments.push(savedAppointment._id);
    await client.save();

    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar agendamento', error: error.message });
  }
};

/**
 * Retorna todos os agendamentos do usuário logado.
 * 
 * Esta função busca todos os agendamentos relacionados ao usuário logado, incluindo os dados dos clientes relacionados.
 * 
 * Retorno: Retorna a lista de agendamentos ou um erro se ocorrer algum problema ao buscar os dados.
 */
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).populate('client', 'name phone cpf');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
  }
};

/**
 * Busca um agendamento específico por ID.
 * 
 * Esta função busca um único agendamento pelo ID fornecido na URL, incluindo os dados do cliente relacionado.
 * 
 * Retorno: Retorna o agendamento encontrado ou um erro caso não seja encontrado.
 */
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id, user: req.user.id }).populate('client', 'name phone cpf');

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamento', error: error.message });
  }
};

/**
 * Atualiza um agendamento existente.
 * 
 * Esta função permite a atualização de um agendamento, incluindo validações de dados e verificação de conflitos.
 * 
 * Retorno: Retorna o agendamento atualizado ou um erro caso algo tenha dado errado.
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, startDate, endDate, service, price, paymentMethod, observations } = req.body;

    // Validação de dados
    const validationError = validateAppointmentData(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Verifica se o cliente existe
    const client = await Client.findOne({ name: clientName, user: req.user.id });
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Verifica se o agendamento existe
    const appointment = await Appointment.findOne({ _id: id, user: req.user.id });
    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verifica se há conflitos de horários, ignorando o próprio agendamento
    const conflict = await checkAppointmentConflict(startDate, endDate, req.user.id, id);
    if (conflict) {
      return res.status(400).json({
        message: `Já existe um agendamento para ${conflict.client.name} entre ${new Date(conflict.startDate).toLocaleTimeString()} e ${new Date(conflict.endDate).toLocaleTimeString()}.`,
        conflictAppointment: conflict
      });
    }

    // Atualiza os dados do agendamento
    appointment.client = client._id;
    appointment.startDate = startDate;
    appointment.endDate = endDate;
    appointment.service = service;
    appointment.price = price;
    appointment.paymentMethod = paymentMethod;
    appointment.observations = observations;

    const updatedAppointment = await appointment.save();

    res.json({ message: 'Agendamento atualizado com sucesso', appointment: updatedAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
  }
};

/**
 * Exclui um agendamento e o remove da lista do cliente.
 * 
 * Esta função exclui um agendamento específico e remove a referência desse agendamento da lista de agendamentos do cliente.
 * 
 * Retorno: Retorna uma mensagem de sucesso ou erro caso algo tenha dado errado.
 */
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Exclui o agendamento
    const appointment = await Appointment.findOneAndDelete({ _id: id, user: req.user.id });
    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Remove o agendamento da lista de agendamentos do cliente
    const client = await Client.findById(appointment.client);
    if (client) {
      client.appointments.pull(appointment._id);
      await client.save();
    }

    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir agendamento', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDateRange,
};
