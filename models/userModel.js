const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
    minlength: 6,
    maxlength: 128,
    trim: true,
    select: false, // <- Isso aqui oculta a senha por padrão
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
