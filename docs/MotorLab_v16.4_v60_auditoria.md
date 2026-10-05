# MotorLab EF — auditoría global OCR v60

## Integridad
- Registros totales: **2.587**
- IDs únicos: **2.587**
- Eliminaciones: **0**
- Fusiones físicas: **0**

## OCR
- Registros OCR `kind: game` procesados: **263/263**
- Duplicados OCR confirmados/enlazados: **11**
- Fragmentos OCR resueltos como no independientes: **252**
- Juegos manuales: **preservados**

La pasada v60 evita convertir cabeceras, índices, objetivos, instrucciones aisladas o frases truncadas en juegos independientes. Los registros se conservan físicamente para trazabilidad.

## Siguiente fase
Integrar el catálogo v60 en `data/games.json`, actualizar el identificador de catálogo de la aplicación y después validar la API `/motorlab/sync` antes de cualquier escritura en PostgreSQL.
