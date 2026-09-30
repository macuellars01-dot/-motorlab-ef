# MotorLab EF v6

Repositorio de juegos de Educación Física, pensado para iPhone/iPad y ordenador.

## Incluye
- Catálogo base de 2.127 registros OCR.
- Fichas editables para corregir errores de extracción.
- Alta manual de nuevos juegos.
- Duplicado de fichas para crear variantes.
- Favoritos.
- Filtro de fichas pendientes de revisar (OCR).
- Estado de ficha: original, editada o añadida manualmente.
- Restauración de una ficha original después de editarla.
- Eliminación/ocultación local sin tocar el catálogo base.
- Exportación de backup completo y de solo cambios.
- Importación de backups.
- Constructor de sesiones con fases, tiempos, agrupamientos y observaciones.
- Persistencia local en el dispositivo.
- PWA/offline y soporte táctil para Safari en iPhone/iPad.

## Importante sobre los cambios
Los PDF originales constituyen el catálogo base. Las correcciones y fichas nuevas se guardan localmente en el navegador mediante `localStorage`; no modifican `data/games.json`.

Para llevar los cambios a otro dispositivo:
1. Abrir **⚙️ Mi catálogo**.
2. Pulsar **Exportar backup**.
3. En el otro dispositivo, abrir **⚙️ Mi catálogo → Importar backup**.

## Publicar en GitHub Pages
El repositorio debe contener `index.html` en la raíz y la carpeta `data/` con `games.json` y `sources.json`. En GitHub: Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Actualización de la PWA
La versión 6 usa un service worker con caché `motorlab-ef-v6`. Los datos `games.json` y `sources.json` se solicitan con `cache: no-store` para evitar que una versión antigua del catálogo quede atrapada en la caché.
