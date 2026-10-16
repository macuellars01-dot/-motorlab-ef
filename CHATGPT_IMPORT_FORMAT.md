# Importación de sesiones de ChatGPT en LUDOMUNDO

Formato: `ludomundo-chat-import-v1`

La función **Importar / Exportar** intercambia sesiones y unidades didácticas. No importa fichas nuevas de juegos en esta primera versión.

```json
{
  "format": "ludomundo-chat-import-v1",
  "units": [
    {
      "id": "unit-ef-cooperacion",
      "name": "Juegos cooperativos"
    }
  ],
  "sessions": [
    {
      "id": "session-cooperacion-01",
      "name": "Cooperación y confianza",
      "date": "2026-10-20",
      "group": "6.º A",
      "studentCount": 24,
      "duration": 60,
      "grouping": "Pequeños grupos",
      "unitId": "unit-ef-cooperacion",
      "objectives": "Cooperar y comunicarse para resolver retos motores.",
      "competencies": "Participación, cooperación y respeto a las reglas.",
      "observations": "Adaptar distancias y roles según las necesidades del grupo.",
      "games": [
        {
          "id": "ID-EXACTO-DEL-CATÁLOGO",
          "phase": "Calentamiento",
          "minutes": 10,
          "grouping": "Gran grupo",
          "note": "Variante opcional"
        }
      ]
    }
  ]
}
```

## Reglas

- El identificador de cada juego debe existir en el catálogo instalado en LUDOMUNDO.
- Fases admitidas por la interfaz: `Sin asignar`, `Calentamiento`, `Parte principal`, `Vuelta a la calma`.
- Los campos `id` de sesión y unidad sirven para actualizar un registro existente; usar IDs nuevos para registros nuevos.
- La importación valida primero y pide confirmación; combina por ID y no borra otros registros.
- Si la sincronización del NAS está configurada, los cambios importados se marcan como pendientes para la sincronización habitual.
- No incluyas tokens, contraseñas ni ajustes de conexión en el JSON.
