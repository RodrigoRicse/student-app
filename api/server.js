import express from "express";
import cors from "cors";
import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";
const PORT = process.env.PORT || 3001;

const server = express();
server.use(cors());
server.use(jsonServer.defaults());

const router = jsonServer.router(dbFile);
const db = router.db;

/* ---------------------------------------------
   Helpers
---------------------------------------------- */
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, teacherDni: user.teacherDni },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function isPasswordValid(storedPassword, providedPassword) {
  if (!storedPassword) return false;
  // If password looks hashed, compare with bcrypt; otherwise plain text
  const isHashed = storedPassword.startsWith("$2");
  return isHashed
    ? bcrypt.compareSync(providedPassword, storedPassword)
    : storedPassword === providedPassword;
}

function authenticate(req, res, next) {
  const publicRoutes = ["/auth/login"];
  if (publicRoutes.some((r) => req.path.startsWith(r))) return next();

  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalido" });
  }
}

function authorize(req, res, next) {
  const publicRoutes = ["/auth/login"];
  if (publicRoutes.some((r) => req.path.startsWith(r))) return next();
  if (req.method === "OPTIONS") return next();

  if (!req.user) {
    return res.status(401).json({ message: "Token requerido" });
  }

  // Admin tiene acceso total
  if (req.user.role === "ADMIN") return next();

  if (req.user.role === "DOCENTE") {
    const isGrades = req.path.startsWith("/grades");
    const isStudentsRead = req.path.startsWith("/students") && req.method === "GET";
    const isCoursesRead = req.path.startsWith("/courses") && req.method === "GET";
    const isSchedulesRead = req.path.startsWith("/schedules") && req.method === "GET";
    const isEnrollmentsRead = req.path.startsWith("/enrollments") && req.method === "GET";

    if (isGrades) return next(); // docente puede crear/editar notas
    if (isStudentsRead) return next(); // docente puede ver alumnos
    if (isCoursesRead) return next(); // docente necesita ver cursos asignados
    if (isSchedulesRead) return next(); // docente necesita ver sus horarios
    if (isEnrollmentsRead) return next(); // docente necesita ver matriculas

    return res.status(403).json({ message: "Acceso no autorizado para docentes" });
  }

  return res.status(403).json({ message: "Rol no autorizado" });
}

/* ---------------------------------------------
   Auth endpoints
---------------------------------------------- */
const authJson = express.json();

server.post("/auth/login", authJson, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email y password son requeridos" });
  }

  const user = db.get("users").find({ email }).value();
  if (!user || !isPasswordValid(user.password, password)) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  const token = createToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teacherDni: user.teacherDni,
    },
  });
});

server.get("/auth/me", authenticate, (req, res) => {
  return res.json({ user: req.user });
});

/* ---------------------------------------------
   Proteccion de rutas JSON Server
---------------------------------------------- */
server.use(authenticate);
server.use(authorize);
server.use(jsonServer.bodyParser);
server.use(router);

server.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
