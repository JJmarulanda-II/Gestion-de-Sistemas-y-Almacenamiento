# 🐔 Pollo Fresh - Sistema Integrado de Punto de Venta e Inventario (IoT)

![Estado del Proyecto](https://img.shields.io/badge/Estado-Prototipo_MVP_Terminado-success)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-Privada-red)

## 📖 Descripción General
Este proyecto es una solución tecnológica integral (Full-Stack + IoT) diseñada específicamente para la PYME "Pollo Fresh", ubicada en Zarzal, Valle del Cauca. El sistema automatiza el registro de entradas, el control de inventario y el Punto de Venta (POS) mediante la digitalización de procesos y la lectura automatizada de hardware.

El mayor valor agregado del sistema es su **Middleware IoT**, el cual captura el peso exacto de los productos directamente desde una báscula electrónica a través del protocolo RS-232, transmitiendo los datos en tiempo real a la interfaz gráfica mediante WebSockets, eliminando así el error humano y la pérdida de trazabilidad.

## 🏗️ Arquitectura y Tecnologías (Stack)

El sistema está construido bajo una arquitectura distribuida en tres capas:

### 1. Capa de Presentación (Frontend)
* **React:** Construcción de la Interfaz de Usuario (SPA).
* **Tailwind CSS:** Diseño responsivo y estilos estructurados.
* **Axios:** Cliente HTTP para el consumo de la API.
* **jsPDF:** Generación de reportes financieros y cierres de caja en formato PDF.

### 2. Capa de Lógica de Negocio (Backend API)
* **Node.js & Express:** Motor de la aplicación y enrutamiento RESTful.
* **MySQL:** Sistema Gestor de Base de Datos Relacional.
* **Sequelize:** ORM para la interacción segura con la base de datos (prevención de inyección SQL y soporte para borrado lógico).
* **JSON Web Tokens (JWT) & bcryptjs:** Cifrado de contraseñas y control de acceso basado en roles (RBAC).

### 3. Capa de Integración de Hardware (Middleware IoT)
* **SerialPort:** Librería para la lectura de tramas asíncronas desde el puerto COM (RS-232) a 9600 baudios.
* **Socket.io (WebSockets):** Transmisión bidireccional en tiempo real del peso capturado hacia el Frontend.

---

## ⚙️ Requisitos Previos

Para ejecutar este proyecto en un entorno local, asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (v16.x o superior)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.0 o superior)
* Convertidor de cable USB a Serial (RS-232) conectado a la báscula física (Configurado en el puerto COM correspondiente).

---

## 🚀 Instalación y Configuración

Sigue estos pasos para desplegar el entorno de desarrollo:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TuUsuario/pollo-fresh-iot.git](https://github.com/TuUsuario/pollo-fresh-iot.git)
cd pollo-fresh-iot

### 2. Configurar el Backend y la base de datos
cd backend
npm install

¡Tienes toda la razón, Juan Manuel! Un proyecto de ingeniería de este calibre no está verdaderamente terminado hasta que tiene un archivo README.md impecable en su repositorio. Este archivo es la carta de presentación de tu código y demuestra un nivel de profesionalismo indispensable en la industria del software.

He estructurado un README.md completo, adaptado exactamente a la arquitectura de Pollo Fresh (con su Frontend, Backend y Middleware IoT). Solo debes copiar el siguiente texto y pegarlo en el archivo README.md en la raíz de tu proyecto en VS Code.

Markdown
# 🐔 Pollo Fresh - Sistema Integrado de Punto de Venta e Inventario (IoT)

![Estado del Proyecto](https://img.shields.io/badge/Estado-Prototipo_MVP_Terminado-success)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-Privada-red)

## 📖 Descripción General
Este proyecto es una solución tecnológica integral (Full-Stack + IoT) diseñada específicamente para la PYME "Pollo Fresh", ubicada en Zarzal, Valle del Cauca. El sistema automatiza el registro de entradas, el control de inventario y el Punto de Venta (POS) mediante la digitalización de procesos y la lectura automatizada de hardware.

El mayor valor agregado del sistema es su **Middleware IoT**, el cual captura el peso exacto de los productos directamente desde una báscula electrónica a través del protocolo RS-232, transmitiendo los datos en tiempo real a la interfaz gráfica mediante WebSockets, eliminando así el error humano y la pérdida de trazabilidad.

## 🏗️ Arquitectura y Tecnologías (Stack)

El sistema está construido bajo una arquitectura distribuida en tres capas:

### 1. Capa de Presentación (Frontend)
* **React:** Construcción de la Interfaz de Usuario (SPA).
* **Tailwind CSS:** Diseño responsivo y estilos estructurados.
* **Axios:** Cliente HTTP para el consumo de la API.
* **jsPDF:** Generación de reportes financieros y cierres de caja en formato PDF.

### 2. Capa de Lógica de Negocio (Backend API)
* **Node.js & Express:** Motor de la aplicación y enrutamiento RESTful.
* **MySQL:** Sistema Gestor de Base de Datos Relacional.
* **Sequelize:** ORM para la interacción segura con la base de datos (prevención de inyección SQL y soporte para borrado lógico).
* **JSON Web Tokens (JWT) & bcryptjs:** Cifrado de contraseñas y control de acceso basado en roles (RBAC).

### 3. Capa de Integración de Hardware (Middleware IoT)
* **SerialPort:** Librería para la lectura de tramas asíncronas desde el puerto COM (RS-232) a 9600 baudios.
* **Socket.io (WebSockets):** Transmisión bidireccional en tiempo real del peso capturado hacia el Frontend.

---

## ⚙️ Requisitos Previos

Para ejecutar este proyecto en un entorno local, asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (v16.x o superior)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.0 o superior)
* Convertidor de cable USB a Serial (RS-232) conectado a la báscula física (Configurado en el puerto COM correspondiente).

---

## 🚀 Instalación y Configuración

Sigue estos pasos para desplegar el entorno de desarrollo:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TuUsuario/pollo-fresh-iot.git](https://github.com/TuUsuario/pollo-fresh-iot.git)
cd pollo-fresh-iot
2. Configurar el Backend y la Base de Datos


🔐 Roles de Usuario
El sistema maneja dos niveles de acceso protegidos por JWT:

Administrador: Acceso total. Puede registrar productos, consultar histórico de movimientos, generar reportes contables PDF y gestionar usuarios.

Cajero: Acceso restringido al módulo de Punto de Venta, lectura de la báscula y registro de ventas diarias.

👥 Autor
Desarrollado como Proyecto de Grado por:

Juan Manuel Marulanda Hernandez

Instituto Técnico Cestelco