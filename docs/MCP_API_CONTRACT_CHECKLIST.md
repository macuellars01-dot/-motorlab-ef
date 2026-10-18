# Comprobación del contrato de sincronización para MCP

Estado: revisión parcial del código del NAS; prueba de lectura real y catálogo pendientes. Este documento no autoriza el despliegue.

## Confirmado en el código del NAS (capturas aportadas el 18-10-2026)

- La API está en `api/server.py` y el endpoint comprueba autorización antes de operar en `/sync`.
- `GET /sync` consulta la tabla `items`, ordena por `updated_at, id` y devuelve `{ "items": [...] }` con `id`, `type`, `data`, `updatedAt` y `deleted`.
- `POST /sync` lee la propiedad `items`, procesa cada registro con un `INSERT INTO items` y usa `ON CONFLICT (id) DO UPDATE` para actualizar `type`, `data` y `deleted`; asigna `updated_at=now()`.
- El código mostrado ejecuta `db.commit()` tras procesar el lote y devuelve `{ "ok": true, "count": len(items) }` si termina correctamente.
- El contenedor de la API aparece en ejecución y publica el puerto 8090 en la captura de Docker.

Estos hallazgos proceden de capturas del código, no de una llamada HTTP en vivo. No se ha verificado la respuesta real del endpoint ni su configuración de red desde el contenedor MCP.

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

## Pendiente de verificar

- Hacer una petición de solo lectura a `GET /sync` y confirmar la respuesta real, sin imprimir token ni datos personales.
- Confirmar si un POST con un registro individual preserva el resto de registros (la implementación visible sugiere que sí, pero aún no se ha probado).
- Identificar el catálogo de juegos real y su esquema/IDs. La búsqueda realizada en `/volume1/docker/motorlab` no encontró archivos de catálogo JSON; el catálogo puede estar en otra ruta o integrado en los archivos de la aplicación.
- Confirmar la ruta base accesible desde el contenedor MCP y la autenticación sin exponer secretos.
- Verificar la compatibilidad de la cuenta ChatGPT con el transporte MCP y las operaciones necesarias.

## Prueba segura antes de cualquier escritura

1. Consultar solo lectura `GET /sync` y validar la forma de respuesta sin imprimir tokens ni contenido sensible en logs.
2. Contrastar únicamente recuentos, tipos y unos pocos IDs, sin copiar sesiones completas ni datos personales.
3. Revisar la semántica de upsert y usar un entorno de prueba con datos desechables antes de la primera escritura.
4. Mantener el adaptador sin desplegar hasta completar estos pasos y revisar autenticación de transporte.

## Seguridad

- No cambiar contraseñas ni tokens durante esta tarea.
- No publicar la API del NAS ni el puerto MCP en Internet.
- No desplegar el prototipo sin autenticación adecuada y autorización para operaciones de escritura.
- No tocar Home Assistant ni la aplicación del formulario de lectura.
