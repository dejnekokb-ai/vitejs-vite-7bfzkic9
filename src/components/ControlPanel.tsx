import React from "react";

export default function ControlPanel({ save, load, isRunning, toggleSim, stepSim }) {
  return (
    <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
      <button onClick={toggleSim}>
        {isRunning ? "Pauza" : "Start Symulacji"}
      </button>
      <button onClick={stepSim} disabled={isRunning}>
        Wykonaj Krok
      </button>
      <button onClick={save}>Zapisz</button>
      <button onClick={load}>Wczytaj</button>
    </div>
  );
}