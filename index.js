import uuid from 'node-uuid';
import mkdirp from 'mkdirp';
import path from 'path';
import fs from 'fs';

const mkderp = dir =>
  new Promise((resolve, reject) => {
    mkdirp(dir, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });

export default function(config) {
  const { storage, preferredKey } = config;
  const dir = storage || path.join(process.cwd(), 'store');
  let getKey;
  switch (typeof preferredKey) {
    case 'function':
      getKey = preferredKey;
      break;
    case 'string':
      getKey = obj => `${obj[preferredKey]}`;
      break;
    default:
      getKey = obj => `${obj['id']}`;
  }

  return {
    dir, // store in this directory

    list() {
      // list all stored objects by reading the file system
      return mkderp(dir)
        .then(() => readDir(dir))
        .then(files =>
          Promise.all(files.filter(f => f.substr(-5) === '.json').map(loadFile))
        );
    },

    // store an object to file

    add(obj) {
      return mkderp(dir).then(
        () =>
          new Promise((resolve, reject) => {
            const name = getKey(obj) || uuid.v4();
            fs.writeFile(
              path.join(dir, `${name}.json`),
              JSON.stringify(obj, null, 2),
              'utf8',
              err => (err ? reject(err) : resolve(name))
            );
          })
      );
    },

    // delete an object's file

    remove(id) {
      mkderp(dir).then(
        () =>
          new Promise((resolve, reject) =>
            fs.unlink(
              path.join(dir, `${id}.json`),
              err => (err ? reject(err) : resolve())
            )
          )
      );
    },

    // load an object from file

    load(id) {
      mkderp(dir).then(() => loadFile(path.join(dir, `${id}.json`)));
    }
  };
}

const readDir = dir =>
  new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) return reject(err);
      resolve(files.map(f => path.join(dir, f)));
    });
  });

const loadFile = f =>
  new Promise((resolve, reject) => {
    fs.readFile(f, 'utf8', (err, code) => {
      if (err) reject('error loading file' + err);
      let jsonObj;
      try {
        jsonObj = JSON.parse(code);
      } catch (e) {
        reject('Error parsing ' + f + ': ' + e);
      }
      resolve(jsonObj);
    });
  });
