import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json());

interface LogEntry {
  stream: 'stdout' | 'stderr' | 'system';
  data: string;
  timestamp: number;
}

interface ProcessState {
  process: ChildProcess;
  startTime: number;
  logs: LogEntry[];
  scriptName: string;
}

interface ScriptInfo {
  name: string;
  size: number;
  modifiedAt: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
  lastExitCode?: number | null;
  lastRunDuration?: number;
}

// Active running processes mapped by script filename
const runningProcesses = new Map<string, ProcessState>();

// Cache of past runs (logs & status)
const lastRunState = new Map<string, {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
  logs: LogEntry[];
  duration?: number;
  exitCode?: number | null;
}>();

// Helper to broadcast WS messages
function broadcast(msg: object) {
  const payload = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function extractScriptDescription(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, 15);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('#') && line.length > 2 && !line.startsWith('#!')) {
        return line.replace(/^#\s*/, '').trim();
      }
      if (line.startsWith('"""') || line.startsWith("'''")) {
        return line.replace(/^("""|''')/, '').replace(/("""|''')$/, '').trim();
      }
    }
  } catch {
    // ignore
  }
  return 'Script Python';
}

function getAvailableScripts(): ScriptInfo[] {
  const files = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const pyFiles: ScriptInfo[] = [];

  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.py')) {
      const fullPath = path.join(ROOT_DIR, file.name);
      const stat = fs.statSync(fullPath);
      const isRunning = runningProcesses.has(file.name);
      const lastState = lastRunState.get(file.name);

      pyFiles.push({
        name: file.name,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        description: extractScriptDescription(fullPath),
        status: isRunning ? 'running' : (lastState ? lastState.status : 'idle'),
        lastExitCode: lastState?.exitCode,
        lastRunDuration: lastState?.duration,
      });
    }
  }

  return pyFiles;
}

// REST API Endpoints
app.get('/api/scripts', (_req, res) => {
  try {
    res.json(getAvailableScripts());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/scripts/:name/content', (req, res) => {
  const { name } = req.params;
  const safeName = path.basename(name);
  if (!safeName.endsWith('.py')) {
    return res.status(400).json({ error: 'Fichier invalide' });
  }

  const filePath = path.join(ROOT_DIR, safeName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier introuvable' });
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  res.json({ name: safeName, content });
});

app.put('/api/scripts/:name/content', (req, res) => {
  const { name } = req.params;
  const { content } = req.body;
  const safeName = path.basename(name);

  if (!safeName.endsWith('.py') || typeof content !== 'string') {
    return res.status(400).json({ error: 'Contenu ou nom invalide' });
  }

  const filePath = path.join(ROOT_DIR, safeName);
  fs.writeFileSync(filePath, content, 'utf-8');
  broadcast({ type: 'scripts_list', scripts: getAvailableScripts() });
  res.json({ success: true, message: 'Fichier sauvegardé' });
});

app.post('/api/scripts', (req, res) => {
  let { name, content } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nom requis' });
  }

  if (!name.endsWith('.py')) {
    name = `${name}.py`;
  }

  const safeName = path.basename(name);
  const filePath = path.join(ROOT_DIR, safeName);

  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: 'Ce fichier existe déjà' });
  }

  const defaultContent = content || `# ${safeName}\n\ndef main():\n    print("Exécution de ${safeName}...")\n\nif __name__ == "__main__":\n    main()\n`;
  fs.writeFileSync(filePath, defaultContent, 'utf-8');
  broadcast({ type: 'scripts_list', scripts: getAvailableScripts() });
  res.status(201).json({ success: true, name: safeName });
});

app.delete('/api/scripts/:name', (req, res) => {
  const { name } = req.params;
  const safeName = path.basename(name);

  if (runningProcesses.has(safeName)) {
    return res.status(400).json({ error: 'Impossible de supprimer un script en cours d\'exécution' });
  }

  const filePath = path.join(ROOT_DIR, safeName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier introuvable' });
  }

  fs.unlinkSync(filePath);
  lastRunState.delete(safeName);
  broadcast({ type: 'scripts_list', scripts: getAvailableScripts() });
  res.json({ success: true });
});

app.get('/api/scripts/:name/logs', (req, res) => {
  const { name } = req.params;
  const running = runningProcesses.get(name);
  if (running) {
    return res.json({ logs: running.logs, isRunning: true });
  }
  const last = lastRunState.get(name);
  return res.json({ logs: last?.logs || [], isRunning: false });
});

function runScript(scriptName: string) {
  const safeName = path.basename(scriptName);
  const filePath = path.join(ROOT_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Le script ${safeName} n'existe pas.`);
  }

  if (runningProcesses.has(safeName)) {
    throw new Error(`Le script ${safeName} est déjà en cours d'exécution.`);
  }

  const startTime = Date.now();
  const logs: LogEntry[] = [];

  const addLog = (stream: 'stdout' | 'stderr' | 'system', data: string) => {
    const entry: LogEntry = { stream, data, timestamp: Date.now() };
    logs.push(entry);
    broadcast({
      type: 'log',
      script: safeName,
      entry,
    });
  };

  addLog('system', `[Système] Démarrage de python3 -u ${safeName}...`);

  // We use python3 -u for unbuffered real-time output
  const pyProcess = spawn('python3', ['-u', safeName], {
    cwd: ROOT_DIR,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  const state: ProcessState = {
    process: pyProcess,
    startTime,
    logs,
    scriptName: safeName,
  };

  runningProcesses.set(safeName, state);
  lastRunState.set(safeName, { status: 'running', logs });

  broadcast({
    type: 'status_change',
    script: safeName,
    status: 'running',
  });
  broadcast({ type: 'scripts_list', scripts: getAvailableScripts() });

  pyProcess.stdout.on('data', (chunk: Buffer) => {
    addLog('stdout', chunk.toString());
  });

  pyProcess.stderr.on('data', (chunk: Buffer) => {
    addLog('stderr', chunk.toString());
  });

  pyProcess.on('error', (err) => {
    addLog('system', `[Erreur] Impossible de lancer le processus : ${err.message}`);
  });

  pyProcess.on('close', (code, signal) => {
    const duration = ((Date.now() - startTime) / 1000);
    runningProcesses.delete(safeName);

    let finalStatus: 'completed' | 'failed' | 'stopped' = code === 0 ? 'completed' : 'failed';
    if (signal) {
      finalStatus = 'stopped';
      addLog('system', `[Système] Processus interrompu par le signal ${signal} (durée : ${duration.toFixed(2)}s).`);
    } else {
      addLog('system', `[Système] Processus terminé avec le code ${code} (durée : ${duration.toFixed(2)}s).`);
    }

    lastRunState.set(safeName, {
      status: finalStatus,
      logs,
      duration,
      exitCode: code,
    });

    broadcast({
      type: 'status_change',
      script: safeName,
      status: finalStatus,
      exitCode: code,
      duration,
    });
    broadcast({ type: 'scripts_list', scripts: getAvailableScripts() });
  });
}

function sendStdin(scriptName: string, input: string) {
  const running = runningProcesses.get(scriptName);
  if (!running || !running.process.stdin) {
    throw new Error(`Le script ${scriptName} n'est pas en cours d'exécution.`);
  }

  const payload = input.endsWith('\n') ? input : `${input}\n`;
  running.process.stdin.write(payload);

  const entry: LogEntry = {
    stream: 'system',
    data: `> [stdin]: ${input}\n`,
    timestamp: Date.now(),
  };
  running.logs.push(entry);
  broadcast({
    type: 'log',
    script: scriptName,
    entry,
  });
}

function killScript(scriptName: string) {
  const running = runningProcesses.get(scriptName);
  if (!running) {
    throw new Error(`Le script ${scriptName} n'est pas en cours d'exécution.`);
  }

  const entry: LogEntry = {
    stream: 'system',
    data: `[Système] Envoi de l'ordre d'arrêt (SIGTERM)...\n`,
    timestamp: Date.now(),
  };
  running.logs.push(entry);
  broadcast({
    type: 'log',
    script: scriptName,
    entry,
  });

  running.process.kill('SIGTERM');

  // Fallback kill after 3 seconds if not terminated
  setTimeout(() => {
    if (runningProcesses.has(scriptName)) {
      try {
        running.process.kill('SIGKILL');
      } catch {
        // ignore
      }
    }
  }, 3000);
}

// REST Execution endpoints
app.post('/api/scripts/run', (req, res) => {
  const { name } = req.body;
  try {
    runScript(name);
    res.json({ success: true, message: `Lancement de ${name}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/scripts/stdin', (req, res) => {
  const { name, input } = req.body;
  try {
    sendStdin(name, input);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/scripts/kill', (req, res) => {
  const { name } = req.body;
  try {
    killScript(name);
    res.json({ success: true, message: `Arrêt demandé pour ${name}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// WebSocket Connection handling
wss.on('connection', (ws) => {
  // Send current list of scripts upon connection
  ws.send(JSON.stringify({
    type: 'scripts_list',
    scripts: getAvailableScripts(),
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.action === 'run' && data.script) {
        runScript(data.script);
      } else if (data.action === 'stdin' && data.script && typeof data.input === 'string') {
        sendStdin(data.script, data.input);
      } else if (data.action === 'kill' && data.script) {
        killScript(data.script);
      }
    } catch (err: any) {
      ws.send(JSON.stringify({ type: 'error', error: err.message }));
    }
  });
});

// Serve static frontend files if built
const distPath = path.join(ROOT_DIR, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[API Server] Serveur backend actif sur http://localhost:${PORT}`);
});
