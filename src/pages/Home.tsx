import Box from "../assets/svg/Box.svg";
import BoxPlus from "../assets/svg/BoxPlus.svg";
import MoneyBag from "../assets/svg/MoneyBag.svg";
import People from "../assets/svg/People.svg";
import Bill from "../assets/svg/Bill.svg";
import ChartLineUp from "../assets/svg/ChartLineUp.svg";
import ShoppingCart from "../assets/svg/ShoppingCart.svg";
import { Link } from "react-router-dom";

export const Home = () => {
  const TodoList = [
    {
      id: 1,
      title: "Gestionar inventario",
      description: "Alta, baja y modificacion de productos",
      icon: Box,
      color: "bg-blue-500",
      borderColor: "border-blue-500",
      hoverColor: "hover:bg-blue-500/10",
      link: "/inventario/gestion-stock",
    },
    {
      id: 2,
      title: "Gestionar cajas",
      description: "Cierra y abre nuevas cajas",
      icon: MoneyBag,
      color: "bg-yellow-500",
      borderColor: "border-yellow-500",
      hoverColor: "hover:bg-yellow-500/10",
      link: "/caja/cierres",
    },
    {
      id: 3,
      title: "Gestionar clientes",
      description: "Alta, baja y modificacion de clientes",
      icon: People,
      color: "bg-green-500",
      borderColor: "border-green-500",
      hoverColor: "hover:bg-green-500/10",
      link: "/clientes",
    },
    {
      id: 4,
      title: "Gestionar ventas",
      description: "Haz una venta",
      icon: ShoppingCart,
      color: "bg-red-500",
      borderColor: "border-red-500",
      hoverColor: "hover:bg-red-500/10",
      link: "/ventas",
    },
    {
      id: 5,
      title: "Agrega un producto",
      description: "Agrega un producto al inventario",
      icon: BoxPlus,
      color: "bg-purple-500",
      borderColor: "border-purple-500",
      hoverColor: "hover:bg-purple-500/10",
      link: "/inventario/productos",
    },
    {
      id: 6,
      title: "Estadisticas",
      description: "Estadisticas de ventas y gastos",
      icon: ChartLineUp,
      color: "bg-orange-500",
      borderColor: "border-orange-500",
      hoverColor: "hover:bg-orange-500/10",
      link: "/estadisticas",
    },
    {
      id: 7,
      title: "Administrar gastos",
      description: "Alta, baja y modificacion de gastos",
      icon: Bill,
      color: "bg-gray-500",
      borderColor: "border-gray-500",
      hoverColor: "hover:bg-gray-500/10",
      link: "/gastos",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bienvenido a Caffito</h2>
      <p className="text-gray-600 mb-6">Cosas que puedes hacer en esta app:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TodoList.map((item) => (
          <Link key={item.id} to={item.link} className="block">
            <div
              className={`p-4 rounded-lg border-2  ${item.borderColor} ${item.hoverColor} hover:shadow-xl transition duration-500`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${item.color} bg-opacity-20`}>
                  <img src={item.icon} alt={item.title} className="w-8 h-8" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${item.color.replace(
                      "bg-",
                      "text-"
                    )}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
