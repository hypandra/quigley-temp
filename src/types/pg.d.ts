declare module 'pg' {
  export interface QueryResult<T = unknown> {
    rows: T[]
    rowCount: number
  }

  export interface PoolConfig {
    connectionString?: string
    ssl?: { ca: string } | boolean
    max?: number
  }

  export class Pool {
    constructor(config?: PoolConfig)
    query<T = unknown>(text: string, values?: unknown[]): Promise<QueryResult<T>>
    end(): Promise<void>
  }

  const pg: {
    Pool: typeof Pool
  }

  export default pg
}
