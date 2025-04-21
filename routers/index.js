const routerUser = require('./userRoutes');
const routerClient = require('./clientRoutes');
const routerAppointment = require('./appointmentRoutes');

module.exports = (app) => {
  app.use('/api/users', routerUser);
  app.use('/api/clients', routerClient);
  app.use('/api/appointments', routerAppointment);
};
