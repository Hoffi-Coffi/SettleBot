import { injectable } from "tsyringe";

@injectable()
export class Logger {
    /**
     * Logs an INFO level message to the console with timestamp.
     * 
     * @param message The message to log.
     * @param callingModule The name of the calling module, for audit purposes.
     */
    info(message: string, callingModule: string = null): void {
        if (callingModule) message += ` (${callingModule})`;
        console.info(`[${this.timeNow()}] <INFO> ${message}`);
    }

    /**
     * Logs a WARN level message to the console with timestamp.
     * @param message The message to log.
     * @param callingModule The name of the calling module, for audit purposes.
     */
    warn(message: string, callingModule: string = null): void {
        if (callingModule) message += ` (${callingModule})`;
        console.warn(`[${this.timeNow()}] <WARN> ${message}`);
    }

    /**
     * Logs an ERROR level message to the console with timestamp.
     * @param message The message to log.
     * @param callingModule The name of the calling module, for audit purposes.
     */
    error(message: string, callingModule: string = null): void {
        if (callingModule) message += ` (${callingModule})`;
        console.error(`[${this.timeNow()}] <ERR> ${message}`);
    }

    /**
     * Gets the current time in a prettified format.
     */
    timeNow(): string {
        var dateNow = new Date();
        return `${this.prettyUnit(dateNow.getHours())}:${this.prettyUnit(dateNow.getMinutes())}:${this.prettyUnit(dateNow.getSeconds())}`;
    }
    
    /**
     * Prettifies the current time unit.
     * @param unit The unit to prettify.
     */
    prettyUnit(unit: number): string {
        return `${((unit < 10) ? "0" : "") + unit}`;
    }
};