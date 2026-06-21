export type PublicUnused = { token: string };

type InternalUsed = { id: number };

const value: InternalUsed = { id: 1 };

export { value };
