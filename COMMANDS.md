# ChipMate — Command Cheatsheet

## Start (use two separate terminals)

**Terminal 1 — Backend**
```bash
cd backend
node index.js
# Runs on http://localhost:5050
```

**Terminal 2 — Frontend**
```bash
cd webui
npm start
# Runs on http://localhost:3000 (opens browser automatically)
```

---

## Stop

| What | How |
|------|-----|
| Either server | `Ctrl + C` in its terminal |
| Stuck process on port 5050 | `lsof -ti :5050 \| xargs kill` |
| Stuck process on port 3000 | `lsof -ti :3000 \| xargs kill` |

---

## Other useful commands

**Install dependencies (first time or after pulling changes)**
```bash
cd backend && npm install
cd ../webui && npm install
```

**Run backend tests**
```bash
cd backend
npm test
```

**Build frontend for production**
```bash
cd webui
npm run build
```

**Serve the production build locally**
```bash
cd webui
npx serve -s build
# Runs on http://localhost:3000
```
