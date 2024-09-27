import { CloneMethodArgs } from './CloneMethodArgs';

describe('CloneMethodArgs', () => {
  @CloneMethodArgs()
  class Vehicle {
    constructor(public props?: { color: string; speed: number }) {}

    public drive<T>(opts: T) {
      return opts;
    }

    public multipleDrive<T, U>(opts1: T, opts2: U) {
      return { opts1, opts2 };
    }

    private accelerate<T>(opts: T) {
      return opts;
    }
  }

  it('should deep clone method args (public method)', () => {
    const opts = {
      driver: {
        name: 'John',
        age: 30,
      },
    };

    const ropts = new Vehicle().drive(opts);
    expect(ropts).toEqual(opts);
    expect(ropts).not.toBe(opts);
    expect(ropts.driver).not.toBe(opts.driver);
  });

  it('should deep clone method args (public method - multiple args)', () => {
    const opts = {
      driver: {
        name: 'John',
        age: 30,
      },
    };

    const ropts = new Vehicle().multipleDrive(opts, opts);

    expect(ropts.opts1).toEqual(opts);
    expect(ropts.opts2).toEqual(opts);

    expect(ropts.opts1).not.toBe(opts);
    expect(ropts.opts1.driver).not.toBe(opts.driver);

    expect(ropts.opts2).not.toBe(opts);
    expect(ropts.opts2.driver).not.toBe(opts.driver);

    expect(ropts.opts1).not.toBe(ropts.opts2);
    expect(ropts.opts1.driver).not.toBe(ropts.opts2.driver);
  });

  it('should deep clone method args (private method)', () => {
    const opts = {
      driver: {
        name: 'John',
        age: 30,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ropts = (new Vehicle() as any).accelerate(opts);
    expect(ropts).toEqual(opts);
    expect(ropts).not.toBe(opts);
    expect(ropts.driver).not.toBe(opts.driver);
  });

  it('should deep clone method args (constructor)', () => {
    const props = { color: 'blue', speed: 80 };

    const vehicle = new Vehicle(props);

    expect(vehicle.props).toEqual(props);
    expect(vehicle.props).not.toBe(props);
  });

  it('should not clone args when type excluded', () => {
    @CloneMethodArgs({ exclude: [Date] })
    class Test {
      constructor(public date: Date) {}

      public test(date: Date) {
        return date;
      }
    }

    const date = new Date(1619856000000);
    const obj = new Test(date);

    expect(obj.date).toBe(date);
    expect(obj.test(date)).toBe(date);
  });

  it('should not clone args when type excluded (mix)', () => {
    @CloneMethodArgs({ exclude: [Date] })
    class Test {
      public testMix<T>(date: Date, opts: T) {
        return { date, opts };
      }
    }

    const date = new Date(1619856000000);
    const opts = { name: 'John', age: 30 };

    const { date: rdate, opts: ropts } = new Test().testMix(date, opts);

    expect(rdate).toBe(date);
    expect(ropts).not.toBe(opts);
  });

  it('should work without annotation', () => {
    class Test {
      public test<T>(opts: T) {
        return opts;
      }
    }

    const SecureTest = CloneMethodArgs({})(Test);

    const opts = { name: 'John', age: 30 };
    const ropts = new SecureTest().test(opts);
    expect(ropts).not.toBe(opts);
  });
});
