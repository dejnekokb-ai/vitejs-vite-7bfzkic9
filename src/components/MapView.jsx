import React from "react";

const SIZE = 20;

function healthColor(hp: number) {
  if (hp > 70) return "#00ff00";
  if (hp > 30) return "#ffaa00";
  return "#ff4444";
}

export default function MapView({
  human,
  dog,
  wolf,
  world,
  isNight,
}) {
  const cells = [];

  const isFenceCell = (
    x: number,
    y: number
  ) => {
    if (!world.hasFence) return false;

    const dx = Math.abs(
      x - world.home.x
    );

    const dy = Math.abs(
      y - world.home.y
    );

    return (
      (dx === 1 && dy <= 1) ||
      (dy === 1 && dx <= 1)
    );
  };

  const humanVision = (
    x: number,
    y: number
  ) => {
    const dist = Math.abs(
      x - human.x
    ) +
    Math.abs(
      y - human.y
    );

    return dist <= 4;
  };

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let icon = "⬜";

      const distToCampfire =
        Math.hypot(
          x - world.home.x,
          y - world.home.y
        );

      const isLitByCampfire =
        world.campfireFuel > 0 &&
        distToCampfire <= 3.5;

      if (
        world.apples.some(
          (a) =>
            a.x === x &&
            a.y === y
        )
      ) {
        icon = "🍎";
      }

      if (
        world.waters.some(
          (w) =>
            w.x === x &&
            w.y === y
        )
      ) {
        icon = "💧";
      }

      if (
        world.woods?.some(
          (w) =>
            w.x === x &&
            w.y === y
        )
      ) {
        icon = "🌲";
      }

      if (isFenceCell(x, y)) {
        icon = "🧱";
      }

      if (
        x === world.home.x &&
        y === world.home.y
      ) {
        icon =
          world.campfireFuel > 0
            ? "🔥"
            : "🏠";
      }

      if (
        x === wolf.x &&
        y === wolf.y
      ) {
        icon = "🐺";
      }

      if (
        x === dog.x &&
        y === dog.y
      ) {
        icon = "🐕";
      }

      if (
        x === human.x &&
        y === human.y
      ) {
        icon = "🧍";
      }

      let bgColor = "#f4f4f4";

      if (isNight) {
        bgColor = isLitByCampfire
          ? "#3a321a"
          : "#111827";
      }

      if (
        humanVision(x, y)
      ) {
        bgColor = isNight
          ? "#2b3448"
          : "#dfe8ff";
      }

      if (
        isFenceCell(x, y)
      ) {
        bgColor = isNight
          ? "#2f301e"
          : "#d8c391";
      }

      const isHuman = (
        x === human.x &&
        y === human.y
      );

      const isDog = (
        x === dog.x &&
        y === dog.y
      );

      const isWolf = (
        x === wolf.x &&
        y === wolf.y
      );

      cells.push(
        <div
          key={`${x}-${y}`}
          style={{
            width: 24,
            height: 24,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            backgroundColor:
              bgColor,
            fontSize: "14px",
            borderRadius: "3px",
            transition:
              "all .3s ease",
          }}
        >
          {icon}

          {isHuman && (
            <div
              style={{
                position:
                  "absolute",
                top: -4,
                left: 2,
                width: 20,
                height: 3,
                background:
                  "#333",
              }}
            >
              <div
                style={{
                  width: `${human.health}%`,
                  height: "100%",
                  background:
                    healthColor(
                      human.health
                    ),
                }}
              />
            </div>
          )}

          {isDog && (
            <div
              style={{
                position:
                  "absolute",
                top: -4,
                left: 2,
                width: 20,
                height: 3,
                background:
                  "#333",
              }}
            >
              <div
                style={{
                  width: `${dog.health}%`,
                  height: "100%",
                  background:
                    healthColor(
                      dog.health
                    ),
                }}
              />
            </div>
          )}

          {isWolf && (
            <div
              style={{
                position:
                  "absolute",
                top: -4,
                left: 2,
                width: 20,
                height: 3,
                background:
                  "#333",
              }}
            >
              <div
                style={{
                  width: `${wolf.health}%`,
                  height: "100%",
                  background:
                    healthColor(
                      wolf.health
                    ),
                }}
              />
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 8,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          fontSize: "12px",
        }}
      >
        <span>
          🧍 {human.goal}
        </span>

        <span>
          🐕 {dog.goal}
        </span>

        <span>
          🐺 {wolf.goal}
        </span>

        <span>
          🔥 {world.campfireFuel}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            `repeat(${SIZE},24px)`,
          gap: 1,
          padding: 4,
          borderRadius: 6,
          background: isNight
            ? "#070b14"
            : "#cfcfcf",
          width: "fit-content",
        }}
      >
        {cells}
      </div>
    </div>
  );
}