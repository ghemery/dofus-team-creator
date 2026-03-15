import express from 'express';
import cors from 'cors';
import teamsRouter from './routes/teams.js';
import adminRouter from './routes/admin.js';
import classesRouter from './routes/classes.js';
import classRatingsRouter from './routes/classRatings.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/classes', classesRouter);
app.use('/api/class-ratings', classRatingsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});
