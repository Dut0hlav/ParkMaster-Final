const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();
const bodyParser = require('body-parser');

server.use(middlewares);
server.use(bodyParser.json());

// Custom login endpoint
server.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = router.db.get('users').value();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.status(200).json({ success: true, username });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Custom register endpoint
server.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = router.db.get('users').value();
  if (users.find(u => u.username === username)) {
    res.status(400).json({ success: false, message: 'User already exists' });
  } else {
    router.db.get('users').push({ username, password }).write();
    res.status(201).json({ success: true, username });
  }
});

// Custom reserve endpoint
server.post('/reserve', (req, res) => {
  const { spot, date, lot, user } = req.body;
  const existing = router.db.get('reservations').find({ spot, date, lot }).value();
  if (existing) {
    res.status(409).json({ success: false, message: 'Spot already reserved' });
  } else {
    router.db.get('reservations').push({ spot, date, lot, user }).write();
    res.status(201).json({ success: true });
  }
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});
