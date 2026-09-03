import React from "react";

export default function RelationsPanel({ human, dog }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 10, marginTop: 10, borderRadius: 5 }}>
      <h3>Relacje</h3>
      <div>Człowiek ↔ Pies = {human.relations.dog}</div>
      <div>Człowiek ↔ Wilk = {human.relations.wolf}</div>
      <div>Pies ↔ Wilk = {dog.relations.wolf}</div>
    </div>
  );
}