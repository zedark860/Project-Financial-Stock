import pino from "pino";
import fs from "fs";
import path from "path";
import os from "os";

class TypeLogs {
    private logger: pino.Logger;

    constructor() {
        this.logger = pino({
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: true,
                }
            }
        });
    }

    // Lógica para salvar arquivos de logs
    public saveLog(name: string, message: string, ip?: string, stack?: string) {
        const dateTimeCurrent = new Date().toISOString().replace(/[:.]/g, "-");
        const pathLogs = path.join(__dirname, "Arquives");

        if (!fs.existsSync(pathLogs)) {
            fs.mkdirSync(pathLogs, { recursive: true });
        }

        const filePath = path.join(pathLogs, `log-${name}-${dateTimeCurrent}.log`);
        const logMessage = ip ? `[IP: ${ip}] ${message}` : message;
        const fullLogMessage = stack ? `${logMessage}\nStack Trace:\n${stack}` : logMessage;

        fs.writeFileSync(filePath, `${fullLogMessage}\n`);
    }

    // Log para informações
    public info(message: unknown, ip?: string) {
        const logMessage = String(message);
        this.logger.info({ ip: ip }, logMessage);
        this.saveLog("info", logMessage, ip);
    }

    // Log para erros
    public error(message: unknown, ip?: string) {
        const logMessage = String(message);
        const stack = message instanceof Error ? message.stack : undefined;
        this.logger.error({ ip: ip, stack }, logMessage);
        this.saveLog("error", logMessage, ip, stack);
    }

    // Log para alertas
    public warn(message: unknown, ip?: string) {
        const logMessage = String(message);
        this.logger.warn({ ip: ip }, logMessage);
        this.saveLog("warn", logMessage, ip);
    }

    // Log para debug
    public debug(message: unknown, ip?: string) {
        const logMessage = String(message);
        this.logger.debug({ ip: ip }, logMessage);
        this.saveLog("debug", logMessage, ip);
    }
}

export default TypeLogs;
