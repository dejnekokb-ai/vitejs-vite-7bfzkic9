export function remember(creature, type, x, y) {
  const exists = creature.memory.locations.some(
    (item) => item.type === type && item.x === x && item.y === y
  );

  if (exists) return creature;

  return {
    ...creature,
    memory: {
      ...creature.memory,
      locations: [...creature.memory.locations, { type, x, y }],
    },
  };
}