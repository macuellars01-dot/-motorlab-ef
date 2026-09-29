# MotorLab EF — publicación para iPhone/iPad

Esta carpeta es la versión web/PWA de MotorLab preparada para publicarse con HTTPS.

## Opción 1 — GitHub Pages
1. Crea un repositorio nuevo en GitHub.
2. Sube **todo el contenido de esta carpeta** (no la carpeta contenedora).
3. En el repositorio: Settings → Pages.
4. En Build and deployment selecciona `Deploy from a branch`.
5. Selecciona la rama principal y la carpeta `/ (root)`.
6. Guarda y espera a que GitHub publique la web.
7. Abre la dirección HTTPS en Safari del iPhone/iPad.
8. Safari → Compartir → Añadir a pantalla de inicio.

El archivo `.nojekyll` ya está incluido.

## Opción 2 — Netlify
1. Crea una cuenta en Netlify.
2. Crea un nuevo sitio y publica esta carpeta, o arrástrala al sistema de despliegue que permita Netlify.
3. Usa la URL HTTPS que te proporcione Netlify.
4. En Safari: Compartir → Añadir a pantalla de inicio.

`netlify.toml` ya está incluido.

## Opción 3 — Vercel
1. Importa este proyecto desde un repositorio Git.
2. No hace falta framework ni comando de build.
3. Publica el proyecto.
4. Abre la URL HTTPS en Safari y añádela a la pantalla de inicio.

`vercel.json` ya está incluido.

## PWA
MotorLab incluye manifest, iconos para iOS/iPadOS y service worker para funcionamiento offline después de la primera carga.
