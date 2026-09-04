export function createWolf(position: { x?: number; y?: number } = {}) {
  return {
    id: crypto.randomUUID(),

    type: "wolf",

    x: position.x ?? 0,
    y: position.y ?? 0,

    health: 100,
    stamina: 100,
// test
    energy: 100,
    hydration: 100,

    age: 0,

    goal: "hunt",

    thought: "Poszukuję zdobyczy",

    memory: {
      locations: [],
      seenHumans: [],
      seenDogs: [],
      dangerousPlaces: [],
    },

    relations: {
      human: -100,
      dog: -80,
    },
  };
}

export function spawnWolf() {
  const edge = Math.floor(Math.random() * 4);

  switch (edge) {
    case 0:
      return createWolf({
        x: 0,
        y: Math.floor(Math.random() * 20),
      });

    case 1:
      return createWolf({
        x: 19,
        y: Math.floor(Math.random() * 20),
      });

    case 2:
      return createWolf({
        x: Math.floor(Math.random() * 20),
        y: 0,
      });

    default:
      return createWolf({
        x: Math.floor(Math.random() * 20),
        y: 19,
      });
  }
}