declare module 'node-serialize' {
  const serialize: {
    serialize(value: unknown): string;
    unserialize(value: string): unknown;
  };

  export default serialize;
}