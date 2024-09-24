/**
 * should compatible with npm:pg and npm:postgres
 */
export interface IsomorphicDB {
  query: (sql: string, params?: any[]) => Promise<any[]>;
  // begin will wrap the multiple queries in a transaction
  begin: <T>(fn: (query: IsomorphicDB["query"]) => Promise<T>) => Promise<T>;

  // event handler
  connect: () => Promise<void>;
  close: () => Promise<void>;
  onCloseEvent: (listener: () => void) => void;
}
