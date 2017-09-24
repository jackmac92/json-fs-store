var Store = require('../bundle'),
  temp = require('temp'),
  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  assert = require('chai').assert;

env = {
  test: true
};

describe('Store', function() {
  let dir;
  let store;

  beforeEach(function() {
    dir = path.join(process.cwd(), 'store');
    // fs.readdirSync(dir).forEach(fileName => {
    //   const filePath = `${dir}/${fileName}`;
    //   fileName.slice(fileName.length - 6, -1)('.json') &&
    //     fs.statSync(filePath).isFile() &&
    //     fs.unlinkSync(filePath);
    // });
    store = Store({ storage: dir });
  });

  it('should store in specified dir', function() {
    assert.equal(store.dir, dir);
  });

  it('should list', function() {
    store.list().then(entries => {
      assert.deepEqual(entries, []);
    });
  });

  it('should save object', function(done) {
    var obj = { id: 'donkey', name: 'burro' };
    store
      .add(obj)
      .then(() => {
        var file = path.join(dir, 'donkey.json');
        assert.isTrue(fs.existsSync(file));
        fs.readFile(file, 'utf8', function(err, content) {
          assert.isNull(err);
          try {
            // assert.deepEqual(obj, JSON.parse(content));
            done();
          } catch (e) {
            console.log(e);
            done(e);
          }
        });
      })
      .catch(console.log);
  });

  it('should remove object', function() {
    var obj = { id: 'donkey', name: 'burro' };
    var file = path.join(store.dir, obj.id + '.json');
    store.add(obj).then(() => {
      assert.isTrue(fs.existsSync(file), 'create file');
      store.remove(obj.id).then(() => {
        assert.isFalse(fs.existsSync(file), 'remove file');
      });
    });
  });

  it('should list objects', function(done) {
    var adds = [1, 2, 3].map(id => store.add({ id, name: `OBJ${id}` }));
    Promise.all(adds).then(names => {
      store.list().then(entries => {
        assert.equal(entries.length, 3);
        assert.deepEqual(entries[0], { id: 1, name: 'OBJ1' });
        assert.deepEqual(entries[1], { id: 2, name: 'OBJ2' });
        assert.deepEqual(entries[2], { id: 3, name: 'OBJ3' });
        done();
      });
    });
  });
});
