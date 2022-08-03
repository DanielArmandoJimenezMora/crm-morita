const mongoose = require("mongoose");

const UsuariosSchema = mongoose.Schema({
  nombre: {
    type: "string",
    required: true,
    trim: true,
  },
  apellido: {
    type: "string",
    required: true,
    trim: true,
  },
  genero: {
    type: "string",
    required: true,
    trim: true,
  },
  email: {
    type: "string",
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: "string",
    required: true,
    trim: true,
    unique: true,
  },
  perfil: {
    type: "string",
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Usuario", UsuariosSchema);
