class Stack {
  constructor() {
    this.top = -1;
    this.items = {};
  }

  get peek() {
    return this.items[this.top];
  }

  push(value) {
    this.top += 1;
    this.items[this.top] = value;
  }
}

describe("My Stack", () => {
  let stack;

  beforeEach(() => {
    stack = new Stack();
  });

  it("is created empty", () => {
    const stack = new Stack();

    expect(stack.top).toBe(-1);
    expect(stack.items).toEqual({});
  });

  it("can push to the top", () => {
    stack.push("🥞");
    stack.push("🍔");
    stack.push("🍟");
    stack.push("🌮");
    expect(stack.top).toBe(3);
    expect(stack.peek).toBe("🌮");
  });
});
