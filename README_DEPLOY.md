# MotorLab EF v6

Repositorio de juegos y planificación de Educación Física, pensado para iPhone/iPad y ordenador.

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
- Repositorio de unidades didácticas: crear, renombrar, editar y vincular sesiones.
- Las sesiones guardadas pueden renombrarse y actualizarse sin duplicarlas.
- Backup completo incluye unidades didácticas y sus vínculos.
- Persistencia local en el dispositivo.
- PWA/offline y soporte táctil para Safari en iPhone/iPad.

### Unidades didácticas y sesiones
- Las sesiones se pueden nombrar y renombrar.
- Una sesión puede vincularse a una unidad didáctica desde el Constructor.
- Puedes crear, editar y renombrar unidades desde el repositorio **Unidades didácticas**.
- Cada unidad muestra sus sesiones vinculadas.
- Al eliminar una unidad, sus sesiones no se borran: quedan sin unidad.
- Las unidades, sesiones y sus vínculos forman parte del backup completo.

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


## v8 · Situaciones de Aprendizaje

Incluye repositorio editable de Unidades Didácticas, campos de planificación LOMLOE, Situaciones de Aprendizaje vinculadas a cada unidad y asociación opcional de sesiones a una Situación. Los datos se guardan localmente y forman parte de los backups.
