const mongoose = require("mongoose");

const ProductosSchema = mongoose.Schema({
  nombre: {
    type: "string",
    required: true,
    trim: true,
  },
  presentacion: {
    type: "string",
    trim: true,
  },
  existencia: {
    type: Number,
    required: true,
    trim: true,
  },
  existenciaDeseada: {
    type: Number,
    required: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
    trim: true,
  },
  preCompra: {
    type: Number,
    trim: true,
  },
  tipoProducto: {
    type: "string",
    required: true,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
});

ProductosSchema.index({ nombre: "text" });

module.exports = mongoose.model("Producto", ProductosSchema);
