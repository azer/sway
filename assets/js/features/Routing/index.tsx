import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./Main";

export default function Routing(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}
