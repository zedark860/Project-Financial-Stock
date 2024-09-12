import 'dotenv/config';
import mysql from 'mysql';

class MySQLService {
    protected pool: mysql.Pool;

    constructor() {
        const host = process.env.MYSQL_HOST as string;
        const user = process.env.MYSQL_USER as string;
        const password = process.env.MYSQL_PASSWORD as string;
        const database = process.env.MYSQL_DATABASE as string;

        if (!host || !user || !password || !database) {
            throw new Error('Missing MySQL credentials');
        }

        this.pool = mysql.createPool({
            host,
            user,
            password,
            database,
            connectionLimit: 500
        });
    }

    public getClient(): mysql.Pool {
        return this.pool;
    }

    public async query(sql: string, pool: mysql.Pool, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.query(sql, params, (error, results, fields) => {
                if (error) {
                    return reject(new Error("Error executing query: " + error));
                }
                resolve(results);
            });
        });
    }

    public async close(pool: mysql.Pool): Promise<void> {
        return new Promise((resolve, reject) => {
            pool.end((error) => {
                if (error) {
                    return reject(new Error("Error closing connection pool: " + error));
                }
                resolve();
            });
        });
    }

    public async beginTransaction(pool: mysql.Pool): Promise<void> {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    return reject(new Error("Error getting connection from pool: " + err));
                }
                connection.beginTransaction((error) => {
                    if (error) {
                        connection.release();
                        return reject(new Error("Error starting transaction: " + error));
                    }
                    resolve();
                });
            });
        });
    }

    public async rollback(pool: mysql.Pool): Promise<void> {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    return reject(new Error("Error getting connection from pool: " + err));
                }
                connection.rollback((error) => {
                    connection.release();
                    if (error) {
                        return reject(new Error("Error rolling back transaction: " + error));
                    }
                    resolve();
                });
            });
        });
    }

    public async commit(pool: mysql.Pool): Promise<void> {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    return reject(new Error("Error getting connection from pool: " + err));
                }
                connection.commit((error) => {
                    connection.release();
                    if (error) {
                        return reject(new Error("Error committing transaction: " + error));
                    }
                    resolve();
                });
            });
        });
    }
}

export default MySQLService;
