import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import logo from "../../assets/LogoCaffito.png";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir a la página principal
    if (authService.isAuthenticated()) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(credentials);
      authService.setToken(response.id_token, credentials.rememberMe);

      // Obtener la URL de redirección del estado de la ubicación o usar la página principal
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError("Credenciales inválidas. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen -my-6 sm:-mx-6 lg:-mx-8 background-login flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-md">
        <div className="flex flex-col justify-center items-center">
          <img src={logo} alt="logo" className="w-80 h-auto" />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Usuario"
                value={credentials.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={credentials.rememberMe}
                onChange={handleChange}
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-900"
              >
                Recordarme
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
