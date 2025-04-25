const routerUser = require('./userRoutes');
const routerClient = require('./clientRoutes');
const routerAppointment = require('./appointmentRoutes');
const routerDev = require('./devRoutes'); // se existir

module.exports = (app) => {
  app.use('/api/users', routerUser);
  app.use('/api/clients', routerClient);
  app.use('/api/appointments', routerAppointment);

  if (process.env.NODE_ENV !== 'production') {
    app.use('/dev', routerDev);
  }
};
