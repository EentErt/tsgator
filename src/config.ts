import fs from "fs";
import os from "os";
import path from "path";
import { config } from "process";

export type Config = {
    dbUrl: string;
    currentUserName: string;
}

export function setUser(config: Config, name: string) {
    config.currentUserName = name;
    
    writeConfig(config);
}

export function readConfig(): Config {
    const filePath = getConfigFilePath();
    const file = fs.readFileSync(filePath, "utf-8");
    const cfg = validateConfig(JSON.parse(file));
    return cfg;
}

function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json");
}

function validateConfig(rawConfig: any): Config {
    const cfg: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name ? rawConfig.current_user_name : undefined,
    }
    return cfg;
}

function writeConfig(cfg: Config) {
    const config = JSON.stringify({
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    })
    const filePath = getConfigFilePath();
    fs.writeFileSync(filePath, config);
}