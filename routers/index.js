const routerUser = require('./userRoutes');
const routerClient = require('./clientRoutes');
const routerAppointment = require('./appointmentRoutes');

module.exports = (app) => {
  app.use(routerUser);
  app.use(routerClient);
  app.use(routerAppointment);
};
