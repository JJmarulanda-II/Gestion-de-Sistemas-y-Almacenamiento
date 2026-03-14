const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Función para Registrar el primer usuario (Solo para desarrollo/setup) ---
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificamos si el correo ya existe en la base de datos
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

  
    const nuevoUsuario = await Usuario.create({ nombre, email, password, rol });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email, rol: nuevoUsuario.rol }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor al registrar usuario.' });
  }
};

// --- Función Principal: Iniciar Sesión (Login) ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscamos al usuario por su correo
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      // Por seguridad, damos un mensaje genérico para no dar pistas a los atacantes
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    // 2. Verificamos si el usuario está activo (por si fue despedido)
    if (!usuario.estado) {
      return res.status(403).json({ mensaje: 'Usuario inactivo. Contacte al administrador.' });
    }

    // 3. Comparamos la contraseña en texto plano con la encriptada en la base de datos
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    // 4. Si todo es correcto, generamos el Token JWT (La credencial digital)
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 5. Enviamos la respuesta de éxito al frontend
    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor al iniciar sesión.' });
  }
};

module.exports = {
  registrarUsuario,
  login
};