const Appointment = require('../models/appointmentModel');
const Client = require('../models/clientModel');

const checkAppointmentConflict = async (startDate, endDate, excludeAppointmentId = null) => {
  const conflictQuery = {
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) }
  };

  if (excludeAppointmentId) {
    conflictQuery._id = { $ne: excludeAppointmentId }; // Ignora o próprio agendamento (em caso de edição)
  }

  const conflict = await Appointment.findOne({ $or: [conflictQuery] }).populate('client', 'name phone cpf');
  return conflict;
};

// Criar agendamento
const createAppointment = async (req, res) => {
  try {
    const { clientName, startDate, endDate, service, price, paymentMethod, observations } = req.body;

    // Verificando se o cliente existe pelo nome
    const client = await Client.findOne({ name: clientName });
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Verifica conflitos de horário
    const conflict = await checkAppointmentConflict(startDate, endDate);
    if (conflict) {
      return res.status(400).json({
        message: `Já existe um agendamento para ${conflict.client.name} entre ${new Date(conflict.startDate).toLocaleTimeString()} e ${new Date(conflict.endDate).toLocaleTimeString()}.`,
        conflictAppointment: conflict
      });
    }





    // Criando o agendamento com o ID do cliente
    const newAppointment = new Appointment({
      client: client._id, // Associando o ID do cliente ao agendamento
      startDate,
      endDate,
      service,
      price,
      paymentMethod,
      observations,
    });

    // Salvando o agendamento
    const savedAppointment = await newAppointment.save();

    // Adicionando o agendamento à lista de agendamentos do cliente
    client.appointments.push(savedAppointment._id);
    await client.save(); // Atualizando o cliente com o novo agendamento

    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar agendamento', error: error.message });
  }
};

// Buscar todos os agendamentos
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('client', 'name phone cpf');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
  }
};

// Buscar agendamento pelo ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate('client', 'name phone cpf');

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamento', error: error.message });
  }
};

// Atualizar agendamento
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, startDate, endDate, service, price, paymentMethod, observations } = req.body;

    // Verificando se o cliente existe pelo nome
    const client = await Client.findOne({ name: clientName });
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    const conflict = await checkAppointmentConflict(startDate, endDate, id);
    if (conflict) {
      return res.status(400).json({
        message: `Já existe um agendamento para ${conflict.client.name} entre ${new Date(conflict.startDate).toLocaleTimeString()} e ${new Date(conflict.endDate).toLocaleTimeString()}.`,
        conflictAppointment: conflict
      });
    }

    // Atualizando os dados do agendamento
    appointment.client = client._id; // Associando o ID do cliente ao agendamento
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

// Excluir agendamento
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Remover o agendamento da lista de agendamentos do cliente
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
};
