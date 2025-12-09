# Student App

Aplicacion web para gestion escolar: autenticacion de usuarios, registro de alumnos, cursos, horarios, matriculas, carga de notas y calculo de promedios/libretas imprimibles.

## Requisitos
- Node.js 18+ y npm.
- Opcional: `json-server` si se usa el mock de datos local (`api/db.json`).

## Instalacion
1) Clonar el repositorio.
2) Instalar dependencias: `npm install`.
3) (Opcional) Datos mock: `npx json-server --watch api/db.json --port 3001`.
4) Ejecutar en desarrollo: `npm run dev` y abrir la URL indicada (por defecto http://localhost:5173).

## Scripts disponibles
- `npm run dev`: servidor de desarrollo con Vite.
- `npm run build`: build de produccion.
- `npm run preview`: vista previa del build.
- `npm run lint`: revisa el codigo con ESLint.

## Datos de ejemplo
El mock vive en `api/db.json` (alumnos, cursos, notas). Si usas otra API, alinea las rutas/base URL en los servicios de `src/features`.

## Funcionalidad principal
- Auth y roles (admin/docente).
- Alumnos, cursos, horarios y matriculas.
- Notas y promedios por alumno y por salon.
- Impresion de libretas: abre un popup y dispara `window.print`; permite imprimir individual o por salon (usa los filtros de grado/seccion).

## Credenciales de prueba
Si tu entorno necesita login, define credenciales de demo en la API/mock y documentalas aqui.

## Estructura rapida
- `src/features/*`: modulos de dominio (auth, students, courses, grades, etc.).
- `src/shared`: componentes/utilidades compartidas.
- `api/db.json`: datos mock para desarrollo sin backend.
