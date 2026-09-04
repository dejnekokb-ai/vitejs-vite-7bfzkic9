export function chooseGoal(creature) {
  if (!creature) return "explore";

  if (creature.health < 35) {
    return "heal";
  }

  if (creature.hydration < 25) {
    return "water";
  }

  if (creature.energy < 25) {
    return "food";
  }

  return "explore";
}

/**
 * Ucieczka od punktu
 */
export function moveAway(entity, targetX, targetY) {
  let newX = entity.x;
  let newY = entity.y;

  if (newX < targetX) newX--;
  else if (newX > targetX) newX++;

  if (newY < targetY) newY--;
  else if (newY > targetY) newY++;

  return {
    ...entity,
    x: Math.max(0, Math.min(19, newX)),
    y: Math.max(0, Math.min(19, newY)),
  };
}

/**
 * Czy jednostka powinna walczyć
 */
export function shouldFight(me, enemy) {
  if (!me || !enemy) return false;

  const myPower =
    me.health +
    me.stamina +
    me.energy;

  const enemyPower =
    enemy.health +
    enemy.stamina +
    enemy.energy;

  return myPower >= enemyPower * 0.8;
}

/**
 * Czy powinna uciekać
 */
export function shouldFlee(me, enemy) {
  if (!me || !enemy) return false;

  const myPower =
    me.health +
    me.stamina +
    me.energy;

  const enemyPower =
    enemy.health +
    enemy.stamina +
    enemy.energy;

  return myPower < enemyPower * 0.7;
}

/**
 * Znajdź znaną lokalizację
 */
export function findKnownLocation(
  creature,
  type
) {
  if (
    !creature ||
    !creature.memory ||
    !creature.memory.locations
  ) {
    return null;
  }

  const found =
    creature.memory.locations.find(
      (location) =>
        location.type === type
    );

  return found || null;
}

/**
 * Zapamiętaj miejsce
 */
export function rememberLocation(
  creature,
  type,
  x,
  y
) {
  if (!creature.memory) {
    creature.memory = {};
  }

  if (!creature.memory.locations) {
    creature.memory.locations = [];
  }

  const exists =
    creature.memory.locations.some(
      (location) =>
        location.type === type &&
        location.x === x &&
        location.y === y
    );

  if (exists) return creature;

  creature.memory.locations.push({
    type,
    x,
    y,
  });

  return creature;
}

/**
 * Przekazywanie wiedzy
 */
export function shareKnowledge(
  source,
  target
) {
  if (
    !source?.memory?.locations ||
    !target?.memory
  ) {
    return target;
  }

  if (!target.memory.locations) {
    target.memory.locations = [];
  }

  source.memory.locations.forEach(
    (location) => {
      const exists =
        target.memory.locations.some(
          (l) =>
            l.type === location.type &&
            l.x === location.x &&
            l.y === location.y
        );

      if (!exists) {
        target.memory.locations.push(
          location
        );
      }
    }
  );

  return target;
}

/**
 * AI człowieka
 */
export function chooseHumanGoal(
  human,
  wolf
) {
  if (!human) {
    return "explore";
  }

  if (
    wolf &&
    shouldFlee(human, wolf)
  ) {
    return "flee_wolf";
  }

  if (
    wolf &&
    shouldFight(human, wolf)
  ) {
    return "fight_wolf";
  }

  return chooseGoal(human);
}

/**
 * AI psa
 */
export function chooseDogGoal(
  dog,
  human,
  wolf
) {
  if (!dog) {
    return "follow";
  }

  if (
    wolf &&
    wolf.health > 0 &&
    human &&
    human.goal === "flee_wolf"
  ) {
    return "defend";
  }

  if (dog.hydration < 25) {
    return "water";
  }

  if (dog.energy < 25) {
    return "food";
  }

  return "follow";
}

/**
 * AI wilka
 */
export function chooseWolfGoal(
  wolf,
  human,
  dog
) {
  if (!wolf) {
    return "wander";
  }

  const wolfPower =
    wolf.health +
    wolf.stamina +
    wolf.energy;

  const enemyPower =
    (human?.health || 0) +
    (dog?.health || 0);

  if (
    wolfPower <
    enemyPower * 0.7
  ) {
    return "retreat";
  }

  if (wolf.hydration < 25) {
    return "water";
  }

  if (wolf.energy < 25) {
    return "food";
  }

  return "hunt";
}