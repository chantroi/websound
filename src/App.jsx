import React, { useState } from "react";
import Nav from "./components/Nav";
import NavItem from "./components/NavItem";
import Audio from "./components/Audio";

export default function App() {
  const navItems = ["Danh Sách", "Bộ Sưu Tập", "Tìm Kiếm", "Trò Chuyện"];
  const [activeNavItem, setActiveNavItem] = useState(null);
  return (
    <div className="h-screen">
      <Nav>
        {navItems.map((item) => (
          <NavItem
            key={item}
            isActive={item === activeNavItem}
            setActiveNavItem={setActiveNavItem}
          >
            {item}
          </NavItem>
        ))}
      </Nav>
      <Audio />
    </div>
  );
}
