export default function Button({ children, cargando, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={cargando}
      className={`w-full py-3 rounded-lg text-black font-bold transition-all ${
        cargando 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-primary hover:bg-yellow-600 shadow-lg hover:shadow-xl'
      }`}
    >
      {cargando ? 'Procesando...' : children}
    </button>
  );
}