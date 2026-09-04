import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import RelationsPanel from "./components/RelationsPanel";
import ControlPanel from "./components/ControlPanel";

import { createHuman } from "./entities/Human";
import { createDog } from "./entities/Dog";
import { createWolf } from "./entities/Wolf";

import { saveState, loadState } from "./systems/SaveSystem";
import { chooseGoal, moveAway } from "./systems/BrainSystem";
import { distance, attack } from "./systems/CombatSystem";

export default function App() {
  const [human, setHuman] = useState(() => createHuman());
  const [dog, setDog] = useState(() => createDog());
  const [wolf, setWolf] = useState(() => createWolf());
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState(["Symulacja gotowa."]);
  const [gameOverReason, setGameOverReason] = useState(null);

  const [timeOfDay, setTimeOfDay] = useState(8);
  const [dayCount, setDayCount] = useState(1);

  const isNight = timeOfDay < 6 || timeOfDay >= 18;

  const [world, setWorld] = useState({
    apples: [{ x: 3, y: 4 }, { x: 12, y: 15 }],
    waters: [{ x: 15, y: 5 }, { x: 2, y: 18 }],
    woods: [{ x: 8, y: 8 }, { x: 16, y: 12 }, { x: 5, y: 12 }],
    home: { x: 18, y: 16 },
    campfireFuel: 0,
    hasFence: false,
  });

  const addLog = (msg) => {
    setLogs((prev) => [msg, ...prev.slice(0, 9)]);
  };

  const moveTowards = (entity, targetX, targetY) => {
    if (!entity) return entity;
    let newX = entity.x;
    let newY = entity.y;

    if (newX < targetX) newX++;
    else if (newX > targetX) newX--;

    if (newY < targetY) newY++;
    else if (newY > targetY) newY--;

    return { ...entity, x: Math.max(0, Math.min(19, newX)), y: Math.max(0, Math.min(19, newY)) };
  };

  const isFenceCell = (x, y) => {
    if (!world.hasFence || !world.home) return false;
    const dx = Math.abs(x - world.home.x);
    const dy = Math.abs(y - world.home.y);
    return (dx === 1 && dy <= 1) || (dy === 1 && dx <= 1) || (dx === 0 && dy === 0);
  };

  const findClosestResource = (entity, resources) => {
    if (!resources || resources.length === 0) return null;
    return resources.reduce((closest, item) => {
      const distToItem = distance(entity, item);
      const distToClosest = distance(entity, closest);
      return distToItem < distToClosest ? item : closest;
    }, resources[0]);
  };

  const restartGame = () => {
    setHuman(createHuman());
    setDog(createDog());
    setWolf(createWolf());
    setTimeOfDay(8);
    setDayCount(1);
    setWorld({
      apples: [{ x: 3, y: 4 }, { x: 12, y: 15 }],
      waters: [{ x: 15, y: 5 }, { x: 2, y: 18 }],
      woods: [{ x: 8, y: 8 }, { x: 16, y: 12 }, { x: 5, y: 12 }],
      home: { x: 18, y: 16 },
      campfireFuel: 0,
      hasFence: false,
    });
    setGameOverReason(null);
    setIsRunning(false);
    setLogs(["Symulacja zrestartowana."]);
  };

  const runStep = () => {
    if (gameOverReason) return;

    setTimeOfDay((prevTime) => {
      const nextTime = (prevTime + 1) % 24;
      if (nextTime === 0) {
        setDayCount((d) => d + 1);
        addLog(`🌅 Nastał nowy dzień! (Dzień ${dayCount + 1})`);
      } else if (nextTime === 18) {
        addLog("🌙 Zapada zmrok...");
      } else if (nextTime === 6) {
        addLog("☀️ Wschód słońca.");
      }
      return nextTime;
    });

    let isHumanFleeing = false;

    setWorld((prevWorld) => {
      let updatedApples = [...(prevWorld.apples || [])];
      let updatedWaters = [...(prevWorld.waters || [])];
      let updatedWoods = [...(prevWorld.woods || [])];
      let fuel = prevWorld.campfireFuel || 0;

      if (isNight && fuel > 0) {
        fuel -= 1;
        if (fuel === 0) addLog("🔥 Ognisko zgasło!");
      }

      if (Math.random() < 0.15 && updatedApples.length < 5) {
        updatedApples.push({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
      }

      if (Math.random() < 0.10 && updatedWaters.length < 3) {
        updatedWaters.push({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
      }

      return {
      if (Math.random() < 0.12 && updatedWoods.length < 4) {
        updatedWoods.push({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
      }

      return {
        ...prevWorld,
        apples: updatedApples,
        waters: updatedWaters,
        woods: updatedWoods,
        campfireFuel: fuel,
      };
    });

    // HUMANS
    setHuman((prevHuman) => {
      if (!prevHuman || prevHuman.health <= 0) return prevHuman;

      let nextHuman = {
        ...prevHuman,
        inventory: prevHuman.inventory || { apples: 0, maxApples: 3, wood: 0, maxWood: 5 }
      };

      nextHuman.hydration = Math.max(0, nextHuman.hydration - 1);
      nextHuman.energy = Math.max(0, nextHuman.energy - 1);

      if (nextHuman.hydration === 0 || nextHuman.energy === 0) {
        nextHuman.health = Math.max(0, nextHuman.health - 2);
        addLog("⚠️ Człowiek cierpi z powodu braku zasobów! -2 HP");
      }

      const distToWolf = wolf && wolf.health > 0 ? distance(nextHuman, wolf) : 999;

      if (distToWolf <= 3) {
        if (nextHuman.health >= (wolf?.health || 0)) {
          nextHuman.goal = "fight_wolf";
          nextHuman = moveTowards(nextHuman, wolf.x, wolf.y);

          if (distance(nextHuman, wolf) <= 1) {
            setWolf((prevWolf) => {
              if (!prevWolf || prevWolf.health <= 0) return prevWolf;
              const updatedWolf = attack(nextHuman, prevWolf);
              if (updatedWolf.health <= 0) {
                addLog("⚔️ Człowiek pokonał wilka!");
                
              }
              return updatedWolf;
            });
          }
        } else {
          nextHuman.goal = "flee_wolf";
          isHumanFleeing = true;
          if (wolf) nextHuman = moveAway(nextHuman, wolf.x, wolf.y);
          addLog("Człowiek ucieka przed wilkiem!");
        }
      } 
      else if (!world.hasFence && nextHuman.inventory?.wood >= 3) {
        nextHuman.goal = "build_fence";
        nextHuman = moveTowards(nextHuman, world.home.x, world.home.y);
      }
      else if (isNight || nextHuman.health < 100) {
        nextHuman.goal = isNight ? "seek_shelter" : "heal_at_home";
        nextHuman = moveTowards(nextHuman, world.home.x, world.home.y);
      } else {
        const goal = chooseGoal ? chooseGoal(nextHuman) : "explore";

        if (goal === "food" && nextHuman.inventory?.apples > 0) {
          nextHuman.energy = 100;
          nextHuman.inventory.apples -= 1;
          nextHuman.goal = "eat_from_inventory";
          addLog("🎒 Człowiek zjadł jabłko z ekwipunku!");
        } else {
          nextHuman.goal = goal;
          let target = world.home;

          if (goal === "water") {
            const closestWater = findClosestResource(nextHuman, world.waters);
            if (closestWater) target = closestWater;
          } else if (goal === "food") {
            const closestApple = findClosestResource(nextHuman, world.apples);
            if (closestApple) target = closestApple;
          } else if (!world.hasFence || (goal === "explore" && nextHuman.inventory?.wood < nextHuman.inventory?.maxWood)) {
            const closestWood = findClosestResource(nextHuman, world.woods);
            if (closestWood) target = closestWood;
          }

          if (target) nextHuman = moveTowards(nextHuman, target.x, target.y);
        }
      }

      setWorld((prevWorld) => {
        let newApples = [...(prevWorld.apples || [])];
        let newWaters = [...(prevWorld.waters || [])];
        let newWoods = [...(prevWorld.woods || [])];
        let fuel = prevWorld.campfireFuel || 0;
        let hasFence = prevWorld.hasFence;

        const waterIndex = newWaters.findIndex((w) => w.x === nextHuman.x && w.y === nextHuman.y);
        if (waterIndex !== -1) {
          nextHuman.hydration = 100;
          newWaters.splice(waterIndex, 1);
          addLog("Człowiek napił się wody.");
        }

        const appleIndex = newApples.findIndex((a) => a.x === nextHuman.x && a.y === nextHuman.y);
        if (appleIndex !== -1) {
          if (nextHuman.energy < 80) {
            nextHuman.energy = 100;
            newApples.splice(appleIndex, 1);
            addLog("Człowiek zjadł jabłko.");
          } else if (nextHuman.inventory?.apples < nextHuman.inventory?.maxApples) {
            nextHuman.inventory.apples += 1;
            newApples.splice(appleIndex, 1);
            addLog(`🎒 Człowiek schował jabłko.`);
          }
        }

        const woodIndex = newWoods.findIndex((w) => w.x === nextHuman.x && w.y === nextHuman.y);
        if (woodIndex !== -1 && nextHuman.inventory?.wood < nextHuman.inventory?.maxWood) {
          nextHuman.inventory.wood += 1;
          newWoods.splice(woodIndex, 1);
          addLog(`🪵 Człowiek zebrał drewno.`);
        }

        if (nextHuman.x === world.home.x && nextHuman.y === world.home.y) {
          if (!hasFence && nextHuman.inventory?.wood >= 3) {
            hasFence = true;
            nextHuman.inventory.wood -= 3;
            addLog("🧱 Wybudowano ogrodzenie!");
          }

          if (nextHuman.inventory?.wood > 0) {
            fuel += nextHuman.inventory.wood * 5;
            addLog(`🔥 Dokładanie do ogniska!`);
            nextHuman.inventory.wood = 0;
          }

          if (nextHuman.health < 100) {
            nextHuman.health = Math.min(100, nextHuman.health + 5);
          }
        }

        return { ...prevWorld, apples: newApples, waters: newWaters, woods: newWoods, campfireFuel: fuel, hasFence };
      });

      return nextHuman;
    });

    // DOG
    setDog((prevDog) => {
      if (!prevDog || prevDog.health <= 0) return prevDog;
      let nextDog = { ...prevDog };

      if ((isHumanFleeing || human?.goal === "flee_wolf") && wolf && wolf.health > 0) {
        nextDog.goal = "defend_human";
        nextDog = moveTowards(nextDog, wolf.x, wolf.y);

        if (distance(nextDog, wolf) <= 1) {
          setWolf((prevWolf) => {
            if (!prevWolf || prevWolf.health <= 0) return prevWolf;
            const updatedWolf = attack(nextDog, prevWolf);
            if (updatedWolf.health <= 0) {
              addLog("🐕 Pies wyeliminował wilka!");
              setGameOverReason("wolf_dead");
              setIsRunning(false);
            }
            return updatedWolf;
          });
        }
      } else if (human) {
        nextDog.goal = "follow";
        nextDog = moveTowards(nextDog, human.x, human.y);
      }

      return nextDog;
    });

    // WOLF
    setWolf((prevWolf) => {
      if (!prevWolf || prevWolf.health <= 0) return prevWolf;
      let nextWolf = { ...prevWolf };

      const distToHome = distance(nextWolf, world.home);
      const isCampfireActive = isNight && world.campfireFuel > 0;

      if (isCampfireActive && distToHome <= 4) {
        nextWolf = moveAway(nextWolf, world.home.x, world.home.y);
        addLog("🐺 Wilk ucieka przed ogniem!");
        return nextWolf;
      }

      const distToHuman = human ? distance(nextWolf, human) : 999;
      const shouldHunt = isNight || distToHuman <= 5;

      if (shouldHunt && human) {
        const plannedWolf = moveTowards(nextWolf, human.x, human.y);

        if (world.hasFence && isFenceCell(plannedWolf.x, plannedWolf.y)) {
          return nextWolf;
        }

        if (dog && dog.health > 0 && distance(nextWolf, dog) <= 1) {
          nextWolf = plannedWolf;
          setDog((pDog) => attack(nextWolf, pDog));
        } else if (human && human.health > 0) {
          nextWolf = plannedWolf;

          if (distance(nextWolf, human) <= 1) {
            setHuman((pHuman) => {
              const updatedHuman = attack(nextWolf, pHuman);
              if (updatedHuman.health <= 0) {
                addLog("☠️ Człowiek zginął!");
                setGameOverReason("human_dead");
                setIsRunning(false);
              }
              return updatedHuman;
            });
          }
        }
      }

      return nextWolf;
    });
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && !gameOverReason) {
      interval = setInterval(() => {
        runStep();
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isRunning, human, dog, wolf, gameOverReason, world, timeOfDay]);

  function saveGame() {
    saveState({ human, dog, wolf, world, timeOfDay, dayCount });
    addLog("Stan gry zapisany.");
  }

  

  function loadGame() {
    const state = loadState();
    if (!state) return;
    if (state.human) setHuman(state.human);
    if (state.dog) setDog(state.dog);
    if (state.wolf) setWolf(state.wolf);
    if (state.world) setWorld(state.world);
    if (state.timeOfDay !== undefined) setTimeOfDay(state.timeOfDay);
    if (state.dayCount !== undefined) setDayCount(state.dayCount);
    setGameOverReason(null);
    addLog("Wczytano stan gry.");
  }

  // Zabezpieczenie przed wyrenderowaniem czegokolwiek jeśli stan nie istnieje
  if (!human || !dog || !wolf || !world) {
    return <div style={{ padding: 20 }}>Ładowanie gry...</div>;
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", position: "relative", minHeight: "100vh", backgroundColor: "#fff" }}>
      <h1>Human Simulation v6</h1>

      {gameOverReason && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          {gameOverReason === "human_dead" ? (
            <h1 style={{ fontSize: "48px", color: "#ff4d4d" }}>GAME OVER</h1>
          ) : (
            <h1 style={{ fontSize: "48px", color: "#4dff4d" }}>ZWYCIĘSTWO!</h1>
          )}
          <button onClick={restartGame} style={{ marginTop: "20px", padding: "12px 24px", cursor: "pointer" }}>
            Zagraj Ponownie 🔄
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div>
          {MapView && (
            <MapView
              human={human.health > 0 ? human : { x: -1, y: -1 }}
              dog={dog.health > 0 ? dog : { x: -1, y: -1 }}
              wolf={wolf.health > 0 ? wolf : { x: -1, y: -1 }}
              world={world}
              isNight={isNight}
            />
          )}
          {ControlPanel && (
            <ControlPanel save={saveGame} load={loadGame} isRunning={isRunning} toggleSim={() => setIsRunning(!isRunning)} stepSim={runStep} />
          )}
          {RelationsPanel && <RelationsPanel human={human} dog={dog} />}
        </div>

        <div style={{ minWidth: "260px" }}>
          <h3>Schronienie & Obiekt:</h3>
          <p>{isNight ? "🌙 Noc" : "☀️ Dzień"} | <b>Godzina:</b> {timeOfDay}:00</p>
          <p>🔥 <b>Ognisko:</b> {world.campfireFuel > 0 ? `Pali się (${world.campfireFuel}h)` : "Zgaszone"}</p>
          <p>🧱 <b>Ogrodzenie:</b> {world.hasFence ? "Wybudowane" : "Brak (3x 🪵)"}</p>

          <h3>Stan postaci:</h3>
          <p>🧍 <b>Człowiek:</b> {human.health > 0 ? `HP: ${human.health} | Cel: ${human.goal}` : "☠️ MARTWY"}</p>
          <p>🎒 <b>Ekwipunek:</b> 🍎 {human.inventory?.apples || 0}/{human.inventory?.maxApples || 3} | 🪵 {human.inventory?.wood || 0}/{human.inventory?.maxWood || 5}</p>
          <p>🐕 <b>Pies:</b> {dog.health > 0 ? `HP: ${dog.health}` : "☠️ MARTWY"}</p>
          <p>🐺 <b>Wilk:</b> {wolf.health > 0 ? `HP: ${wolf.health}` : "☠️ MARTWY"}</p>

          <h3>Dziennik zdarzeń:</h3>
          <div style={{ background: "#222", color: "#0f0", padding: 10, borderRadius: 5, fontSize: "12px", height: "200px", overflowY: "auto" }}>
            {logs.map((log, idx) => (
              <div key={idx}>&gt; {log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}