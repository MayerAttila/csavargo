import { existsSync, openSync, closeSync } from "node:fs";
import { createConnection } from "node:net";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));

function listening(host, port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const finish = (ready) => { socket.destroy(); resolve(ready); };
    socket.setTimeout(1500);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", windowsHide: true, timeout: 120000 });
  if (result.error || result.status !== 0) throw new Error(`Local service command failed: ${command}. See the startup output above.`);
}

async function main() {
  const envFile = join(root, "csavargo-api", ".env");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL. Create csavargo-api/.env from its .env.example first.");
  const database = new URL(process.env.DATABASE_URL);
  const localDatabase = ["localhost", "127.0.0.1", "[::1]"].includes(database.hostname);
  const host = database.hostname === "localhost" ? "127.0.0.1" : database.hostname.replace(/^\[|\]$/g, "");
  const port = Number(database.port || 5432);
  const data = join(root, ".local", "postgres");
  const native = process.platform === "win32" && localDatabase && existsSync(join(data, "PG_VERSION"));

  if (!await listening(host, port)) {
    if (native) {
      console.log("Starting project-local PostgreSQL...");
      run("pg_ctl", ["-D", data, "-l", join(root, ".local", "postgres.log"), "-o", `-p ${port} -h ${host}`, "start"]);
    } else if (localDatabase) {
      console.log("Starting PostgreSQL and Mailpit with Docker Compose...");
      run("docker", ["compose", "up", "-d", "--wait"]);
    }
    if (!await listening(host, port)) throw new Error("The configured database is unavailable. Backend startup stopped.");
  }
  console.log(`Database port ready: ${host}:${port}`);

  if ((process.env.MAIL_PROVIDER ?? "smtp") !== "smtp") return;
  const smtpHost = process.env.SMTP_HOST ?? "127.0.0.1";
  const smtpPort = Number(process.env.SMTP_PORT ?? 1025);
  if (await listening(smtpHost, smtpPort)) return;
  const mailpit = join(root, ".local", "bin", "mailpit.exe");
  if (native && existsSync(mailpit) && ["localhost", "127.0.0.1"].includes(smtpHost)) {
    const log = openSync(join(root, ".local", "mailpit.log"), "a");
    const child = spawn(mailpit, ["--listen", "127.0.0.1:8025", "--smtp", `127.0.0.1:${smtpPort}`], {
      cwd: root, windowsHide: true, detached: true, stdio: ["ignore", log, log],
    });
    closeSync(log);
    await new Promise((resolve, reject) => { child.once("spawn", resolve); child.once("error", reject); });
    child.unref();
    for (let attempt = 0; attempt < 20; attempt++) {
      if (await listening(smtpHost, smtpPort)) { console.log("Mailpit ready: http://localhost:8025"); return; }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  } else if (localDatabase && !native) {
    run("docker", ["compose", "up", "-d", "--wait", "mailpit"]);
    if (await listening(smtpHost, smtpPort)) return;
  }
  throw new Error("The configured SMTP server is unavailable. Start Mailpit or configure MAIL_PROVIDER before starting development.");
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
