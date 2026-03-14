// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Guardia Principal: Verifica que el usuario tenga un token válido
const verificarToken = (req, res, next) => {
  // Buscamos el token en las cabeceras (headers) de la petición
  let token = req.header('Authorization');

 
  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Se requiere un token de seguridad.' });
  }

  try {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    // Desencriptamos el token usando nuestra llave secreta
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    

    req.usuario = verificado; 
    next(); 
  } catch (error) {
    // Si el token fue modificado por un atacante o ya caducó (pasaron las 8 horas)
    res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};

// Verifica que el usuario tenga el rol de ADMIN
const esAdmin = (req, res, next) => {
  // Esta función asume que verificarToken ya se ejecutó y guardó a req.usuario
  if (req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Esta acción requiere privilegios de Administrador.' });
  }

  next();
};

module.exports = {
  verificarToken,
  esAdmin
};