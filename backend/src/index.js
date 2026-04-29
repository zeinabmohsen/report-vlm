import express   from 'express';
import cors      from 'cors';
import helmet    from 'helmet';
import path      from 'path';
import { fileURLToPath } from 'url';
import { config }        from './config/env.js';
import apiRoutes         from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler }  from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app       = express();

app.use(helmet());
app.use(cors({
  origin:         config.frontendUrl,
  methods:        ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(requestLogger);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api',     apiRoutes);

app.get('/api/health', (_req, res) => res.json({
  status:    'ok',
  model:     config.qwen.model,
  endpoint:  config.qwen.baseUrl,
  timestamp: new Date().toISOString(),
}));

app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`\n  POS Chat Backend  →  http://localhost:${config.port}`);
  console.log(`  Qwen              →  ${config.qwen.baseUrl}`);
  console.log(`  Model             →  ${config.qwen.model}\n`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

export default app;
