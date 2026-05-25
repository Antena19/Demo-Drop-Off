# Sistema Inteligente Drop Off — Demo

Demostración web del **monitoreo del área Drop Off** del **Colegio Genios Traviesos**. Todo corre en el navegador con datos de ejemplo (sin backend real).

## ¿De qué se trata?

- **Dashboard** con indicadores del día.
- **Monitoreo en vivo**: cámaras, vehículos en zona, tiempos de permanencia y escenarios operativos (lluvia, congestión, patente sin registrar, etc.).
- **Apoderados**: registro de patentes autorizadas.
- **Infracciones** e **eventos operacionales**.
- **Configuración** del puesto de monitoreo.

El login acepta cualquier usuario y contraseña; sirve solo para entrar a la interfaz.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (recomendado LTS)
- npm (viene con Node)

## Clonar y ejecutar

```bash
git clone <URL-del-repositorio>
cd Demo-Drop-Off
npm install
npm start
```

Abre en el navegador: **http://localhost:4200**

Para compilar sin levantar el servidor:

```bash
npm run build
```

## Nota sobre los videos de cámaras

Los videos van en `public/videos/camaras/`: `camaraNorte.mp4` y `camaraSur.mp4`. En monitoreo se reproducen en bucle (silenciados). Si falta alguno, esa cámara muestra señal no disponible.

## Tecnología

Angular 19 · TypeScript · Tailwind CSS
