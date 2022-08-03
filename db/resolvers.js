const Usuario = require("../models/usuario");
const Producto = require("../models/Producto");
const Proveedor = require("../models/Proveedor");
const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });

const crearToken = (usuario, secreta, expiresIn) => {
  //console.log(usuario);
  const { id, email, nombre, apellido, genero, perfil } = usuario;

  return jwt.sign({ id, email, nombre, apellido, genero, perfil }, secreta, {
    expiresIn,
  });
};

// Resolvers
const resolvers = {
  Query: {
    obtenerUsuario: async (_, {}, ctx) => {
      return ctx.usuario;
    },
    obtenerUsuarioById: async (_, { id }) => {
      // Revisar si el usuario existe o no
      const usuario = await Usuario.findById(id);

      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      return usuario;
    },
    obtenerUsuariosById: async () => {
      try {
        const usuarios = await Usuario.find({});
        return usuarios;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerUsuarios: async () => {
      try {
        const usuarios = await Usuario.find({});
        return usuarios;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      // Revisar si el producto existe o no
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      return producto;
    },

    obtenerProveedor: async (_, { id }) => {
      // Revisar si el proveedor existe o no
      const proveedor = await Proveedor.findById(id);
      if (!proveedor) {
        throw new Error("Proveedor no encontrado");
      }

      return proveedor;
    },
    obtenerProveedores: async () => {
      try {
        const proveedores = await Proveedor.find({});
        return proveedores;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (b_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({
          vendedor: ctx.usuario.id.toString(),
        });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }) => {
      // Revisar si el cliente existe o no
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      return cliente;
    },
    obtenerPedidos: async () => {
      try {
        const pedidos = await Pedido.find({}).populate("cliente");
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_, {}, ctx) => {
      try {
        const pedidos = await Pedido.find({
          vendedor: ctx.usuario.id,
        }).populate("cliente");
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerPedido: async (_, { id }, ctx) => {
      // Si el pedido existe o no
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      // Solo quien lo creo puede verlo
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Acción no autorizada");
      }

      // Retornar el resultado
      return pedido;
    },
    obtenerPedidosEstado: async (_, { estado }, ctx) => {
      const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });
      return pedidos;
    },
    mejoresClientes: async () => {
      const clientes = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        { $group: { _id: "$cliente", total: { $sum: "$total" } } },
        {
          $lookup: {
            from: "clientes",
            localField: "_id",
            foreignField: "_id",
            as: "cliente",
          },
        },
        {
          $sort: { total: -1 },
        },
      ]);
      return clientes;
    },
    mejoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        { $group: { _id: "$vendedor", total: { $sum: "$total" } } },
        {
          $lookup: {
            from: "usuarios",
            localField: "_id",
            foreignField: "_id",
            as: "vendedor",
          },
        },
        {
          $limit: 5,
        },
        {
          $sort: { total: -1 },
        },
      ]);
      return vendedores;
    },
    buscarProducto: async (_, { texto }) => {
      const productos = await Producto.find({
        $text: { $search: texto },
      }).limit(10);
      return productos;
    },
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;

      // Revisar si el usuario ya está registrado
      const existeUsuario = await Usuario.findOne({ email });
      //console.log(existeUsuario);
      if (existeUsuario) {
        throw new Error("El usuario ya está registrado");
      }

      // Hashear el password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      try {
        // Guardar el usuario en la base de datos
        const usuario = new Usuario(input);
        usuario.save(); //Guardar el usuario en la base de datos
        return usuario;
      } catch (error) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      // Revisar si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      // Revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );
      if (!passwordCorrecto) {
        throw new Error("El password es incorrecto");
      }

      // Crear el token
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, "24h"),
      };
    },
    actualizarUsuario: async (_, { id, input }) => {
      // Verificar si el usuario ya está registrado
      let usuario = await Usuario.findById(id);
      let { password } = input;

      if (!usuario) {
        throw new Error("El usuario no existe");
      }

      // Actualizar el usuario
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);
      usuario = await Usuario.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return usuario;
    },
    eliminarUsuario: async (_, { id }) => {
      try {
        // Revisar si el usuario existe
        let usuario = await Usuario.findById(id);

        if (!usuario) {
          throw new Error("Usuario no encontrado");
        }

        // Eliminar el usuario
        await Usuario.findOneAndDelete({ _id: id });

        return "Usuario eliminado";
      } catch (error) {
        console.log(error);
      }
    },
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);

        // Almacenar el producto en la base de datos
        const resultado = await producto.save();

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      try {
        // Revisar si el producto existe
        let producto = await Producto.findById(id);

        if (!producto) {
          throw new Error("Producto no encontrado");
        }

        // Actualizar el producto
        producto = await Producto.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });

        return producto;
      } catch (error) {
        console.log(error);
      }
    },
    eliminarProducto: async (_, { id }) => {
      try {
        // Revisar si el producto existe
        let producto = await Producto.findById(id);

        if (!producto) {
          throw new Error("Producto no encontrado");
        }

        // Eliminar el producto
        await Producto.findOneAndDelete({ _id: id });

        return "Producto eliminado";
      } catch (error) {
        console.log(error);
      }
    },

    nuevoProveedor: async (_, { input }) => {
      try {
        const proveedor = new Proveedor(input);

        // Almacenar el proveedor en la base de datos
        const resultado = await proveedor.save();

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProveedor: async (_, { id, input }) => {
      try {
        // Revisar si el proveedor existe
        let proveedor = await Proveedor.findById(id);

        if (!proveedor) {
          throw new Error("Proveedor no encontrado");
        }

        // Actualizar el proveedor
        proveedor = await Proveedor.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });

        return proveedor;
      } catch (error) {
        console.log(error);
      }
    },
    eliminarProveedor: async (_, { id }) => {
      try {
        // Revisar si el proveedor existe
        let proveedor = await Proveedor.findById(id);

        if (!proveedor) {
          throw new Error("Proveedor no encontrado");
        }

        // Eliminar el proveedor
        await Proveedor.findOneAndDelete({ _id: id });

        return "Proveedor eliminado";
      } catch (error) {
        console.log(error);
      }
    },

    nuevoCliente: async (_, { input }, ctx) => {
      // Verificar si el cliente ya está registrado
      //console.log(ctx);
      const { telefono } = input;
      const cliente = await Cliente.findOne({ telefono });
      if (cliente) {
        throw new Error("El cliente ya está registrado");
      }

      const nuevoCliente = new Cliente(input);

      // Asignar el vendedor
      nuevoCliente.vendedor = ctx.usuario.id;

      // Guardar el cliente en la base de datos
      try {
        const resultado = await nuevoCliente.save();

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_, { id, input }, ctx) => {
      // Verificar si el cliente ya está registrado
      let cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("El cliente no existe");
      }

      // Verificar si el vendedor  es quien edita
      /*  if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes permiso para editar este cliente");
      } */

      // Actualizar el cliente
      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx) => {
      // Verificar si el cliente ya está registrado
      let cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("El cliente no existe");
      }

      // Verificar si el vendedor  es quien elimina
      /* if (cliente.vendedor.toString() !== ctx.usuario.id || ) {
        throw new Error("No tienes permiso para eliminar este cliente");
      } */

      // Eliminar el cliente
      await Cliente.findOneAndDelete({ _id: id });
      return "Cliente eliminado";
    },
    nuevoPedido: async (_, { input }, ctx) => {
      const { cliente } = input;
      // Verificar si el cliente ya está registrado
      let clienteExiste = await Cliente.findById(cliente);
      if (!clienteExiste) {
        throw new Error("El cliente no existe");
      }

      /* // Verificar si el cliente es del vendedor
      if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      } */

      // Revisar que el stock este disponible
      for await (const articulo of input.pedido) {
        const { id } = articulo;

        const producto = await Producto.findById(id);

        if (articulo.cantidad > producto.existencia) {
          throw new Error(
            `El articulo ${producto.nombre} exede la cantidad disponible`
          );
        } else {
          // Restar la cantidad a lo disponible
          producto.existencia = producto.existencia - articulo.cantidad;
          await producto.save();
        }
      }

      // Crear un nuevo pedido
      const nuevoPedido = new Pedido(input);

      // Asignarle un vendedor
      nuevoPedido.vendedor = ctx.usuario.id;

      // Guardar el pedido en la base de datos
      const resultado = await nuevoPedido.save();
      return resultado;
    },
    actualizarPedido: async (_, { id, input }, ctx) => {
      const { cliente } = input;
      // Verificar si el pedido existe
      const existePedido = await Pedido.findById(id);
      if (!existePedido) {
        throw new Error("El pedido no existe");
      }

      // Verificar si el cliente existe
      const existeCliente = await Cliente.findById(cliente);
      if (!existeCliente) {
        throw new Error("El cliente no existe");
      }

      // Si el cliente y pedido  pertenece al vendedor
      /* if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes permiso para eliminar este cliente");
      } */

      // Revisar el stock
      if (input.pedido) {
        for await (const articulo of input.pedido) {
          const { id } = articulo;

          const producto = await Producto.findById(id);

          if (articulo.cantidad > producto.existencia) {
            throw new Error(
              `El articulo ${producto.nombre} exede la cantidad disponible`
            );
          } else {
            // Restar la cantidad a lo disponible
            producto.existencia = producto.existencia - articulo.cantidad;
            await producto.save();
          }
        }
      }
      // Guardar el pedido en la base de datos
      const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return resultado;
    },
    eliminarPedido: async (_, { id }, ctx) => {
      // Verificar si el pedido existe o no
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Error("El pedido no existe");
      }

      // Verificar si el vendedor es quien lo borra
      /* if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes permiso para eliminar este pedido");
      } */

      // Eliminar el pedido
      await Pedido.findOneAndDelete({ _id: id });
      return "Pedido eliminado";
    },
  },
};

module.exports = resolvers;
