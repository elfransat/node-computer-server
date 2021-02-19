"use strict";

const path = require("path");
const fs = require("fs").promises;

const storageConfig = require("./storageConfig.json");
const storageFile = path.join(__dirname, storageConfig.storageFile);

//wrapper function for all of the datastorage logic
function createDataStorage() {
  const { CODES, MESSAGES } = require(path.join(
    __dirname,
    storageConfig.errorCodes
  ));

  //private API

  // Reading from storage file
  async function readStorage() {
    try {
      const data = await fs.readFile(storageFile, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  // Writing to storage file
  async function writeStorage(data) {
    try {
      await fs.writeFile(storageFile, JSON.stringify(data, null, 4), {
        encoding: "utf8",
        flag: "w",
      });
      return MESSAGES.WRITE_OK();
    } catch (error) {
      return MESSAGES.WRITE_ERROR(error.message);
    }
  }
  // Adding data to the storage file
  async function getFromStorage(id) {
    return (await readStorage()).find((computer) => computer.id == id) || null;
  }

  // Adding data to the storage file

  async function addToStorage(newComputer) {
    const storage = await readStorage();
    if (storage.find((computer) => computer.id == newComputer.id)) {
      return false;
    } else {
      storage.push({
        id: +newComputer.id,
        name: newComputer.name,
        type: newComputer.type,
        amount: newComputer.amount,
        price: newComputer.price,
      });
      await writeStorage(storage);
      return true;
    }
  }

  // Removing computer data from the storage
  async function removeFromStorage(id) {
    let storage = await readStorage();
    const i = storage.findIndex((computer) => computer.id == id);
    if (i < 0) return false;
    storage.splice(i, 1);
    await writeStorage(storage);
    return true;
  }

  // Updating storage data

  async function updateStorage(computer) {
    let storage = await readStorage();
    const oldComputer = storage.find(
      (oldComputer) => oldComputer.id == computer.id
    );
    if (oldComputer) {
      Object.assign(oldComputer, {
        id: +computer.id,
        name: computer.name,
        type: computer.type,
        amount: computer.amount,
        price: computer.price,
      });
      await writeStorage(storage);
      return true;
    } else {
      return false;
    }
  }

  class Datastorage {
    get CODES() {
      return CODES;
    }

    // START CLASS //

    getAll() {
      return readStorage();
    }

    // Get computer by id
    get(id) {
      return new Promise(async (resolve, reject) => {
        if (!id) {
          reject(MESSAGES.NOT_FOUND("<empty id>"));
        } else {
          const result = await getFromStorage(id);
          if (result) {
            resolve(result);
          } else {
            reject(MESSAGES.NOT_FOUND(id));
          }
        }
      });
    }
    // Insert new computer to the storage

    insert(computer) {
      return new Promise(async (resolve, reject) => {
        if (!(computer && computer.id && computer.name && computer.type)) {
          reject(MESSAGES.NOT_INSERTED());
        } else {
          if (await addToStorage(computer)) {
            resolve(MESSAGES.INSERT_OK(computer.id));
          } else {
            reject(MESSAGES.ALREADY_IN_USE(computer.id));
          }
        }
      });
    }
    // Remove computer from storage based on id

    remove(id) {
      return new Promise(async (resolve, reject) => {
        if (!id) {
          reject(MESSAGES.NOT_FOUND("<empty>"));
        } else {
          if (await removeFromStorage(id)) {
            resolve(MESSAGES.REMOVE_OK(id));
          } else {
            reject(MESSAGES.NOT_REMOVED());
          }
        }
      });
    }
    // Update computer data

    update(computer) {
      return new Promise(async (resolve, reject) => {
        if (!(computer && computer.id && computer.name && computer.type)) {
          reject(MESSAGES.NOT_UPDATED());
        } else {
          if (await updateStorage(computer)) {
            resolve(MESSAGES.UPDATE_OK(computer.id));
          } else {
            reject(MESSAGES.NOT_UPDATED());
          }
        }
      });
    }
  }
  return new Datastorage();
}

// END CLASS //

module.exports = {
  createDataStorage,
};
