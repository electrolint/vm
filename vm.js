const assert = (predicate, message) => {
  if (!predicate) {
    throw message;
  }
};

const Type = Object.freeze({
  0: Symbol("Type.EMPTY"),
  1: Symbol("Type.INTEGER"),
  2: Symbol("Type.POINTER"),
});

class Memory {
  constructor(slots) {
    this.state = new Uint32Array(4 * slots);
  }
  _head(slot) {
    return this.state[4 * slot + 0];
  }
  _tail(slot) {
    return this.state[4 * slot + 1];
  }
  _tags(slot) {
    return this.state[4 * slot + 2];
  }
  _free(slot) {
    return this.state[4 * slot + 3];
  }
  headType(slot) {
    return Type[(this._tags(slot) >>> 0) & 0b11];
  }
  tailType(slot) {
    return Type[(this._tags(slot) >>> 2) & 0b11];
  }
  headInteger(slot) {
    assert(this.headType(slot) === Type[1], "Expected integer.");
    return this._head(slot);
  }
  tailInteger(slot) {
    assert(this.tailType(slot) === Type[1], "Expected integer.");
    return this._tail(slot);
  }
  headPointer(slot) {
    assert(this.headType(slot) === Type[2], "Expected pointer.");
    return this._head(slot);
  }
  tailPointer(slot) {
    assert(this.tailType(slot) === Type[2], "Expected pointer.");
    return this._tail(slot);
  }
}

class Register {
  constructor() {
    this.state = new Uint32Array(2);
  }
  _bits() {
    return this.state[0];
  }
  _tags() {
    return this.state[1];
  }
  type() {
    return Type[(this._tags() >>> 0) & 0b11];
  }
  getInteger() {
    assert(this.type() === Type[1], "Expected integer.");
    return this.state[0];
  }
  setInteger(value) {
    this.state[0] = value;
    this.state[1] = 1;
  }
}

class VM {
  constructor(slots) {
    this.memory = new Memory(slots);
    this.pc = 0; // Start executing from slot zero.
    this.queue = []; // Control-state FIFO.
  }
  initialise() {
    // TODO: Translate and load firmware from assembly definition.
    this.memory.state[0] = 100;
    this.memory.state[1] = 1;
    this.memory.state[2] = 0b1001;
    this.memory.state[3] = 0;
    this.memory.state[4] = 150;
    this.memory.state[5] = 2;
    this.memory.state[6] = 0b1001;
    this.memory.state[7] = 0;
    this.memory.state[8] = 200;
    this.memory.state[9] = 0;
    this.memory.state[10] = 0b0001;
    this.memory.state[11] = 0;
  }
  sequence() {
    let cursor = this.pc;
    let instructions = [];
    while (true) {
      let instruction = this.memory.headInteger(cursor);
      instructions.push(instruction);
      if (this.memory.tailType(cursor) !== Type[0]) {
        cursor = this.memory.tailPointer(cursor);
      } else {
        break;
      }
    }
    console.log("Instruction sequence: ", instructions);
    // TODO: Concatenate implementation of each instruction, into Javascript "switch" definition.
  }
  run() {
    this.initialise();
    do {
      this.sequence();
      this.pc = this.queue.shift();
    } while (this.pc !== undefined);
  }
}

new VM(65536).run();
