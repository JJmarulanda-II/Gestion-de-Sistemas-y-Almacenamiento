import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import InputField from '../components/InputField';
import Button from '../components/Button';
import logo from '../assets/logo.jpeg';
import fondo from '../assets/fondo-repo.png';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const resultado = await login(email, password);
    
    if (!resultado.success) {
      setError(resultado.mensaje);
      setCargando(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Pollo Fresh Logo" 
            className="w-32 h-32 object-contain rounded-full border-4 border-primary shadow-md"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Acceso al Sistema
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField 
            label="Correo Electrónico"
            type="email"
            placeholder="admin@pollofresh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={true}
          />

          <InputField 
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={true}
          />

          <Button type="submit" cargando={cargando}>
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}