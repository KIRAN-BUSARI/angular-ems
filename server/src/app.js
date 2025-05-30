import express from 'express';
import morgan from 'morgan';
import EmployeeRotues from "./routes/employee.route.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(morgan('dev'));
app.use(cookieParser())

app.get('/', (_, res) => {
  res.json({ message: 'Hello World' });
});

app.use('/api/employees', EmployeeRotues);

export { app };