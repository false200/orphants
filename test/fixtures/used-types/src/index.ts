type Id = string;

type Box<T> = { value: T };

interface Named {
  name: string;
}

interface Extended extends Named {
  age: number;
}

class Person implements Named {
  constructor(public name: string) {}
}

enum Status {
  Active = "active",
  Inactive = "inactive",
}

type UnusedStatusHelper = Status;

const box: Box<Id> = { value: "1" };
const person: Extended = { name: "bob", age: 30 };
const status: Status = Status.Active;

export { box, person, status };
