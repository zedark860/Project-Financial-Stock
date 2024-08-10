import 'dotenv/config';
import mysql from "mysql";

class MySQLService {

    protected connection: mysql.Connection;

    constructor() {
        const host = process.env.MYSQL_HOST as string;
        const user = process.env.MYSQL_USER as string;
        const password = process.env.MYSQL_PASSWORD as string;
        const database = process.env.MYSQL_DATABASE as string;

        if (!host || !user || !password || !database) {
            throw new Error('Missing MySQL credentials');
        }

        this.connection = mysql.createConnection({
            host, user, password, database
        });

        try {
            this.connection.connect((err) => {
                if (err) {
                    console.error('Error connecting to MySQL:', err.stack);
                    return;
                }
            });
        } catch (error) {
            throw new Error("Error connecting to MySQL: " + error);
        }
}

    protected getClient(): mysql.Connection {
        return this.connection;
    }

    public async query(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, params, (error, results, fields) => {
                if (error) {
                    return reject(new Error("Error executing query: " + error));
                }
                resolve(results);
            });
        });
    }

    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.end((error) => {
                if (error) {
                    return reject(new Error("Error closing connection: " + error));
                }
                resolve();
            });
        });
    }

    public async beginTransaction(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.beginTransaction((error) => {
                if (error) {
                    return reject(new Error("Error starting transaction: " + error));
                }
                resolve();
            });
        });
    }

    public async rollback(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.rollback((error) => {
                if (error) {
                    return reject(new Error("Error rolling back transaction: " + error));
                }
                resolve();
            });
        });
    }

    public async commit(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.commit((error) => {
                if (error) {
                    return reject(new Error("Error committing transaction: " + error));
                }
                resolve();
            });
        });
    }

}

export default MySQLService;