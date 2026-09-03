export function createHuman(position: { x?: number; y?: number } = {}) {
  return {
    id: crypto.randomUUID(),

    type: "human",

    x: position.x ?? 10,
    y: position.y ?? 10,

    health: 100,
    stamina: 100,

    energy: 80,
    hydration: 80,

    age: 0,

    mood: "Dobry",

    goal: "explore",

    thought: "Rozpoczynam eksplorację",

    inventory: {
      apples: 0,
      maxApples: 3,

      wood: 0,
      maxWood: 5,

      water: 0,
      maxWater: 2,
    },

    memory: {
      locations: [],

      discoveredWaters: [],
      discoveredApples: [],
      discoveredWoods: [],

      dangerousPlaces: [],

      knownWolfPositions: [],

      visitedPlaces: [],

      events: [],
    },

    relations: {
      dog: 100,
      wolf: -100,
    },

    stats: {
      wolvesKilled: 0,
      applesEaten: 0,
      waterDrunk: 0,
      distanceTravelled: 0,
      daysSurvived: 0,
    },
  };
}