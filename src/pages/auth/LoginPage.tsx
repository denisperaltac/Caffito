import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import logo from "../../assets/LogoCaffito.png";
import Loader from "../../components/common/Loader";

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
      <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-2xl">
        <div className="flex flex-col justify-center items-center">
          <img src={logo} alt="logo" className="w-80 h-auto select-none" />
        </div>
        <form className="mt-8 space-y-2" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="relative pb-3">
              <input
                id="username"
                name="username"
                type="text"
                required
                className="peer w-full px-4 pt-3 pb-3 text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder-transparent focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                placeholder="Usuario"
                value={credentials.username}
                onChange={handleChange}
              />
              <label
                htmlFor="username"
                className="absolute left-4 -top-6 text-gray-500 text-md transition-all peer-placeholder-shown:top-3  peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-red-500"
              >
                Usuario
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                className="peer w-full px-4 pt-3 pb-3 text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder-transparent focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={handleChange}
              />
              <label
                htmlFor="password"
                className="absolute left-4 -top-6 text-gray-500 text-md transition-all peer-placeholder-shown:top-3  peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-red-500"
              >
                Contraseña
              </label>
            </div>
          </div>

          {error ? (
            <div className="text-red-500 text-sm text-center h-4">{error}</div>
          ) : (
            <div className="h-4"></div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative h-10 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader size={"sm"} color={"red"} />
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-500 -mb-4 mt-2">
          {new Date().getFullYear()} - Caffito. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
