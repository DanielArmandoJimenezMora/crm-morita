const { gql } = require("apollo-server");

// Schema
const typeDefs = gql`
  type Usuario {
    id: ID
    nombre: String
    apellido: String
    genero: String
    email: String
    perfil: String
    password: String
    creado: String
  }

  type Token {
    token: String
  }

  type Producto {
    id: ID
    nombre: String
    presentacion: String
    existencia: Int
    existenciaDeseada: Int
    precio: Float
    preCompra: Float
    tipoProducto: String
    creado: String
  }

  type Proveedor {
    id: ID
    nombre: String
    telefono: String
    direccion: String
    email: String
    categoria: String
    creado: String
  }

  type Cliente {
    id: ID
    nombre: String
    apellido: String
    telefono: String
    direccion: String
    nombreNegocio: String
    email: String
    genero: String
    vendedor: ID
  }

  type Pedido {
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: Cliente
    vendedor: ID
    fecha: String
    estado: EstadoPedido
  }

  type PedidoGrupo {
    id: ID
    cantidad: Int
    nombre: String
    precio: Float
  }

  type TopCliente {
    total: Float
    cliente: [Cliente]
  }

  type TopVendedor {
    total: Float
    vendedor: [Usuario]
  }

  input UsuarioInput {
    id: ID
    nombre: String!
    apellido: String!
    genero: String!
    email: String!
    password: String!
    perfil: String
  }

  input AutenticarInput {
    email: String!
    password: String!
  }

  input ProductoInput {
    nombre: String!
    presentacion: String
    existencia: Int!
    existenciaDeseada: Int!
    precio: Float!
    preCompra: Float
    tipoProducto: String!
  }

  input ProveedorInput {
    id: ID
    nombre: String!
    telefono: String!
    direccion: String!
    email: String
    categoria: String
  }

  input ClienteInput {
    id: ID
    nombre: String!
    apellido: String
    telefono: String!
    direccion: String
    nombreNegocio: String
    email: String
    genero: String!
  }

  input PedidoProductoInput {
    id: ID
    cantidad: Int
    nombre: String
    precio: Float
  }

  input PedidoInput {
    pedido: [PedidoProductoInput]
    total: Float
    cliente: ID
    estado: EstadoPedido
  }

  enum EstadoPedido {
    PENDIENTE
    COMPLETADO
    CANCELADO
  }

  type Query {
    # Usuarios
    obtenerUsuario: Usuario
    obtenerUsuarioById(id: ID!): Usuario
    obtenerUsuarios: [Usuario]
    obtenerUsuariosById: [Usuario]

    # Productos
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto

    #Proveedores
    obtenerProveedores: [Proveedor]
    obtenerProveedor(id: ID!): Proveedor

    # Clientes
    obtenerClientes: [Cliente]
    obtenerClientesVendedor: [Cliente]
    obtenerCliente(id: ID!): Cliente

    # Pedidos
    obtenerPedidos: [Pedido]
    obtenerPedidosVendedor: [Pedido]
    obtenerPedido(id: ID!): Pedido
    obtenerPedidosEstado(estado: String!): [Producto]

    # Busquedas Avanzadas
    mejoresClientes: [TopCliente]
    mejoresVendedores: [TopVendedor]
    buscarProducto(texto: String!): [Producto]
  }

  type Mutation {
    # Usuarios
    nuevoUsuario(input: UsuarioInput): Usuario
    autenticarUsuario(input: AutenticarInput): Token
    actualizarUsuario(id: ID!, input: UsuarioInput): Usuario
    eliminarUsuario(id: ID!): String

    # Productos
    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String

    # Proveedores
    nuevoProveedor(input: ProveedorInput): Proveedor
    actualizarProveedor(id: ID!, input: ProveedorInput): Proveedor
    eliminarProveedor(id: ID!): String

    # Clientes
    nuevoCliente(input: ClienteInput): Cliente
    actualizarCliente(id: ID!, input: ClienteInput): Cliente
    eliminarCliente(id: ID!): String

    # Pedidos
    nuevoPedido(input: PedidoInput): Pedido
    actualizarPedido(id: ID!, input: PedidoInput): Pedido
    eliminarPedido(id: ID!): String
  }
`;

module.exports = typeDefs;
