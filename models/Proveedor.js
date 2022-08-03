const mongoose = require("mongoose");

const ProveedoresSchema = mongoose.Schema({
  nombre: {
    type: "string",
    required: true,
    trim: true,
  },
  telefono: {
    type: "string",
    trim: true,
    unique: true,
    required: true,
  },
  direccion: {
    type: "string",
    trim: true,
    required: true,
  },
  email: {
    type: "string",
    trim: true,
  },
  categoria: {
    type: "string",
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Proveedores", ProveedoresSchema);
