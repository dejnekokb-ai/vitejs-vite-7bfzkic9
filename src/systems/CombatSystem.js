export function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Całkowita siła jednostki
 */
export function getPower(entity) {
  if (!entity) return 0;

  return (
    entity.health +
    entity.stamina +
    entity.energy
  );
}

/**
 * Ocena szans walki
 */
export function shouldFight(me, enemy) {
  return getPower(me) >= getPower(enemy) * 0.8;
}

/**
 * Ocena potrzeby ucieczki
 */
export function shouldFlee(me, enemy) {
  return getPower(me) < getPower(enemy) * 0.7;
}

/**
 * Oblicz obrażenia
 */
export function calculateDamage(
  attacker,
  target
) {
  const attackPower =
    Math.max(
      5,
      Math.floor(
        attacker.health * 0.05 +
        attacker.stamina * 0.05 +
        attacker.energy * 0.03
      )
    );

  const randomBonus =
    Math.floor(Math.random() * 6);

  let damage =
    attackPower + randomBonus;

  const critical =
    Math.random() < 0.10;

  if (critical) {
    damage *= 2;
  }

  return {
    damage,
    critical,
  };
}

/**
 * Główna funkcja ataku
 */
export function attack(
  attacker,
  target
) {
  if (!attacker || !target) {
    return target;
  }

  const result =
    calculateDamage(
      attacker,
      target
    );

  let updatedTarget = {
    ...target,
  };

  updatedTarget.health =
    Math.max(
      0,
      target.health - result.damage
    );

  updatedTarget.stamina =
    Math.max(
      0,
      target.stamina - 3
    );

  return updatedTarget;
}

/**
 * Zmęczenie po walce
 */
export function applyFightCost(
  entity
) {
  return {
    ...entity,

    stamina: Math.max(
      0,
      entity.stamina - 5
    ),

    energy: Math.max(
      0,
      entity.energy - 4
    ),
  };
}

/**
 * Regeneracja po walce
 */
export function recoverStamina(
  entity
) {
  return {
    ...entity,

    stamina: Math.min(
      100,
      entity.stamina + 1
    ),
  };
}

/**
 * Ocena zagrożenia
 */
export function threatLevel(
  me,
  enemy
) {
  const myPower =
    getPower(me);

  const enemyPower =
    getPower(enemy);

  if (
    enemyPower >
    myPower * 1.5
  ) {
    return "extreme";
  }

  if (
    enemyPower >
    myPower
  ) {
    return "high";
  }

  if (
    enemyPower >
    myPower * 0.8
  ) {
    return "medium";
  }

  return "low";
}

/**
 * Czy jednostka żyje
 */
export function isAlive(
  entity
) {
  return (
    entity &&
    entity.health > 0
  );
}