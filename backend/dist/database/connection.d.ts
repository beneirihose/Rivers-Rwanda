import mysql from 'mysql2/promise';
export declare let pool: mysql.Pool;
export declare const connectDatabase: () => Promise<void>;
export declare const query: <T = any>(sql: string, params?: any[]) => Promise<T>;
//# sourceMappingURL=connection.d.ts.map