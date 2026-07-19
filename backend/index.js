require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/utils/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const driveRoutes = require('./src/routes/driveRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const seedUsers = require('./src/utils/seedUsers');
const seedData = require('./src/utils/seedData');

connectDB().then(async () => {
  await seedUsers();
  await seedData();
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/materials', materialRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
