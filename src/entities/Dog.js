export function createDog(position: { x?: number; y?: number } = {}) {
  return {
    id: crypto.randomUUID(),

    type: "dog",

    x: position.x ?? 11,
    y: position.y ?? 10,

    health: 100,
    stamina: 100,

    energy: 100,
    hydration: 100,

    age: 0,

    goal: "follow",

    thought: "Podążam za człowiekiem",

    inventory: {
      food: 0,
    },

    memory: {
      locations: [],
      discoveredWaters: [],
      discoveredApples: [],
      dangerousPlaces: [],
      knownWolfPositions: [],
    },

    relations: {
      human: 100,
      wolf: -80,
    },
  };
}