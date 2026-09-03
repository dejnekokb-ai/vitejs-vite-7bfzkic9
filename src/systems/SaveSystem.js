const SAVE_KEY = "human-simulation-v7";
const BACKUP_KEY = "human-simulation-v7-backup";

export function saveState(state) {
  try {
    const saveData = {
      version: 7,
      savedAt: new Date().toISOString(),
      state,
    };

    const json = JSON.stringify(saveData);

    localStorage.setItem(SAVE_KEY, json);
    localStorage.setItem(BACKUP_KEY, json);

    return true;
  } catch (error) {
    console.error(
      "Błąd podczas zapisu gry:",
      error
    );

    return false;
  }
}

export function loadState() {
  try {
    const raw =
      localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return null;
    }

    const saveData =
      JSON.parse(raw);

    return saveData.state;
  } catch (error) {
    console.error(
      "Błąd podczas wczytywania:",
      error
    );

    return null;
  }
}

export function loadBackup() {
  try {
    const raw =
      localStorage.getItem(BACKUP_KEY);

    if (!raw) {
      return null;
    }

    const saveData =
      JSON.parse(raw);

    return saveData.state;
  } catch (error) {
    console.error(
      "Błąd podczas wczytywania kopii:",
      error
    );

    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(
    SAVE_KEY
  );

  localStorage.removeItem(
    BACKUP_KEY
  );
}

export function hasSave() {
  return !!localStorage.getItem(
    SAVE_KEY
  );
}

export function autoSave(state) {
  try {
    const saveData = {
      version: 7,
      autoSave: true,
      savedAt:
        new Date().toISOString(),
      state,
    };

    localStorage.setItem(
      `${SAVE_KEY}-auto`,
      JSON.stringify(saveData)
    );
  } catch (error) {
    console.error(
      "Błąd autosave:",
      error
    );
  }
}

export function loadAutoSave() {
  try {
    const raw =
      localStorage.getItem(
        `${SAVE_KEY}-auto`
      );

    if (!raw) {
      return null;
    }

    const saveData =
      JSON.parse(raw);

    return saveData.state;
  } catch (error) {
    console.error(
      "Błąd odczytu autosave:",
      error
    );

    return null;
  }
}