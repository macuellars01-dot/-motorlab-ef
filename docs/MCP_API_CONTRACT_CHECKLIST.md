# Comprobación del contrato de sincronización para MCP

Estado: pendiente de comprobar contra la API real del NAS. Este documento no autoriza el despliegue.

## Lo que confirma el frontend de LUDOMUNDO

El frontend actual (app.js, rama main) construye registros con esta forma:

```json
{
  "id": "identificador",
  "type": "session",
  "data": {
    "id": "identificador",
    "name": "Nombre de la sesión",
    "date": "YYYY-MM-DD",
    "group": "Grupo",
    "students": "Número de alumnos",
    "duration": "Duración prevista",
    "grouping": "Gran grupo",
    "unitId": "",
    "objectives": "",
    "competencies": "",
    "observations": "",
    "games": [
      { "id": "id-del-juego", "phase": "Sin asignar", "minutes": "", "grouping": "Gran grupo", "note": "" }
    ],
    "updatedAt": "fecha ISO"
  },
  "updatedAt": "fecha ISO",
  "deleted": false
}
```

Las unidades se envían como registros `type: "unit"`, con `data` que incluye al menos `id`, `name` y `updatedAt`. Las eliminaciones se representan mediante `deleted: true` y `data: null`; el adaptador MCP no debe crear ni alterar tombstones.

El frontend lee `GET /sync` y espera un objeto cuya propiedad `items` sea una lista de registros. Envía lotes mediante `POST /sync` con cuerpo `{"items":[...]}`.

## Pendiente de verificar en el servidor real

No se ha accedido al NAS ni a la implementación del endpoint en esta revisión. Por tanto, siguen sin confirmarse:

- El formato real de respuesta y los códigos HTTP de `GET /sync` y `POST /sync`.
- Si el endpoint valida `type`, `data`, `updatedAt` y `deleted`, y cómo trata IDs repetidos.
- Si un POST con un único registro hace upsert sin borrar ni sustituir otros registros.
- Si la ruta base configurada desde el contenedor es accesible por la red Docker y acepta el token existente.
- Si el catálogo JSON montado en el contenedor coincide con el catálogo usado por la app y conserva los IDs reales.

## Prueba segura antes de cualquier escritura

1. Consultar solo lectura `GET /sync` y validar la forma de respuesta sin imprimir tokens ni contenido sensible en logs.
2. Contrastar el resultado con un pequeño conjunto de IDs y tipos, sin copiar sesiones completas ni datos personales.
3. Revisar la implementación del endpoint y confirmar la semántica de upsert.
4. Si la semántica no puede confirmarse por código, usar un entorno de prueba separado y datos desechables; no experimentar sobre los datos de producción.
5. Mantener el adaptador sin desplegar hasta completar estos pasos y revisar autenticación de transporte.

## Seguridad

- No cambiar contraseñas ni tokens durante esta tarea.
- No publicar la API del NAS ni el puerto MCP en Internet.
- No desplegar el prototipo sin autenticación adecuada y autorización para operaciones de escritura.
- No tocar Home Assistant ni la aplicación del formulario de lectura.