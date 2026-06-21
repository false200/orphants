type UnusedProfile = {
  id: string;
  bio: string;
};

type UnusedRole = "admin" | "user" | "guest";

interface UnusedConfig {
  debug: boolean;
  timeout: number;
}

enum UnusedTheme {
  Light = "light",
  Dark = "dark",
}

type UserId = string;

interface User {
  id: UserId;
  name: string;
}

const user: User = {
  id: "1",
  name: "demo",
};

export { user };
