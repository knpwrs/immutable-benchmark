import { Suite } from 'benchmark';
import {
  inc,
  lensPath,
  lensProp,
  over,
} from 'ramda';
import produce from 'immer';
import pc from 'pass-context';

const initialState = {
  foo: 0,
  bar: 'a',
  turtle: {
    foo: 1,
    bar: 'b',
    turtle: {
      foo: 2,
      bar: 'c',
      turtle: {
        foo: 3,
        bar: 'd',
        turtle: {
          foo: 4,
          bar: 'e',
          turtle: {
            foo: 5,
            bar: 'f',
            turtle: {
              foo: 6,
              bar: 'g',
              turtle: {
                foo: 7,
                bar: 'h',
                turtle: {
                  foo: 8,
                  bar: 'i',
                  turtle: {
                    foo: 9,
                    bar: 'j',
                  },
                },
              },
            },
          },
        },
      },
    }
  },
};
initialState.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle = initialState;

const runSuite = (name, fn) => {
  global.gc();
  console.log(name);
  const suite = new Suite();
  fn(name, suite);
  suite.on('cycle', (event) => {
    console.log(String(event.target));
  });
  suite.on('complete', pc((that, event) => {
    console.log(`Fastest is '${that.filter('fastest').map('name')}'`);
    console.log();
  }));
  suite.run();
};

runSuite('set property', (name, suite) => {
  const check = (name, oldState, newState) => {
    if (oldState === newState) {
      throw new Error(`SAME STATE OBJECT: ${name}`);
    }
    if (oldState.foo === 1) {
      throw new Error(`MUTATED OLD STATE: ${name}`);
    }
    if (newState.foo !== 1) {
      throw new Error(`INCORRECT RESULT: ${name}`);
    }
  };

  const ramda = `${name} (ramda)`;
  suite.add(ramda, () => {
    check(ramda, initialState, over(lensProp('foo'), inc, initialState));
  });

  const immer = `${name} (immer)`;
  suite.add(immer, () => {
    check(immer, initialState, produce(initialState, (draft) => {
      draft.foo++;
    }));
  });

  const nilla = `${name} (vanilla)`;
  suite.add(nilla, (name, suite) => {
    const newState = {
      ...initialState,
      foo: initialState.foo + 1,
    };
    check(nilla, initialState, newState);
  });
});

runSuite('set deep property', (name, suite) => {
  const check = (name, oldState, newState) => {
    if (oldState === newState) {
      throw new Error(`SAME STATE OBJECT: ${name}`);
    }
    if (oldState.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.foo === 10) {
      throw new Error(`MUTATED OLD STATE: ${name} (ramda)`);
    }
    if (newState.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.foo !== 10) {
      throw new Error(`INCORRECT RESULT: ${name} (ramda)`);
    }
  };

  const ramda = `${name} (ramda)`;
  suite.add(ramda, () => {
    check(ramda, initialState, over(
      lensPath(['turtle', 'turtle', 'turtle', 'turtle', 'turtle', 'turtle', 'turtle', 'turtle', 'turtle', 'foo']),
      inc,
      initialState,
    ));
  });

  const immer = `${name} (immer)`;
  suite.add(immer, () => {
    check(immer, initialState, produce(initialState, (draft) => {
      draft.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.foo++;
    }));
  });

  const nilla = `${name} (vanilla)`;
  suite.add(nilla, (name, suite) => {
    const newState = {
      ...initialState,
      turtle: {
        ...initialState.turtle,
        turtle: {
          ...initialState.turtle.turtle,
          turtle: {
            ...initialState.turtle.turtle.turtle,
            turtle: {
              ...initialState.turtle.turtle.turtle.turtle,
              turtle: {
                ...initialState.turtle.turtle.turtle.turtle.turtle,
                turtle: {
                  ...initialState.turtle.turtle.turtle.turtle.turtle.turtle,
                  turtle: {
                    ...initialState.turtle.turtle.turtle.turtle.turtle.turtle.turtle,
                    turtle: {
                      ...initialState.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle,
                      turtle: {
                        ...initialState.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle,
                        foo: initialState.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.turtle.foo + 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    check(nilla, initialState, newState);
  });
});
