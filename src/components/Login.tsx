import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Cargar credenciales guardadas si existen
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRemember = localStorage.getItem('rememberMe');
    
    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('¡Cuenta creada! Por favor revisa tu email para confirmar tu cuenta.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Guardar credenciales si "Recordar" está activado
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('rememberMe');
        }

        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white border border-gray-200 rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
            Roncoroni
          </h1>
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Crear nueva cuenta' : 'Iniciar sesión'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition text-sm"
              placeholder="••••••••"
            />
          </div>

          {!isSignUp && (
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Recordar credenciales
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

