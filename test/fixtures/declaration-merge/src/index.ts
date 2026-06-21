interface User {
  id: string;
}

interface User {
  name: string;
}

type DeadMergeHelper = User;

const user: User = { id: "1", name: "ann" };

export { user };
