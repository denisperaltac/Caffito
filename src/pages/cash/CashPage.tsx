import React from "react";
import { Outlet } from "react-router-dom";

const CashPage: React.FC = () => {
  return (
    <div className="flex h-full">
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default CashPage;
