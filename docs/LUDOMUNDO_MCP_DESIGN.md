# Diseño de integración MCP para LUDOMUNDO

Estado: propuesta técnica; todavía no desplegada.

## Objetivo
Permitir que ChatGPT consulte el catálogo de juegos y cree/actualice sesiones y unidades didácticas de LUDOMUNDO mediante herramientas MCP específicas.

## Restricciones obligatorias
- No cambiar contraseñas ni tokens existentes.
- No modificar ni reiniciar Home Assistant ni el formulario de lectura.
- No exponer directamente la API actual de MotorLab ni su token a Internet.
- No escribir directamente en PostgreSQL desde MCP.
- Mantener intacta la aplicación de producción hasta validar la integración por separado.

## Herramientas MCP propuestas
1. `search_games(query, age, material, space, intensity, limit)`: lectura filtrada del catálogo.
2. `get_game(game_id)`: lectura de una ficha.
3. `list_sessions()`: listar sesiones existentes.
4. `get_session(session_id)`: consultar una sesión.
5. `save_session(session)`: crear o actualizar una sesión tras validar IDs de juegos y campos.
6. `list_units()`: listar unidades.
7. `save_unit(unit)`: crear o actualizar una unidad.
8. `health_check()`: comprobar conectividad sin devolver secretos.

## Arquitectura segura
ChatGPT -> servidor MCP HTTPS con autenticación -> adaptador de MotorLab -> API existente de sincronización -> almacenamiento actual.

El servidor MCP no debe recibir el token en prompts ni mostrarlo en resultados. El token existente, si se reutiliza internamente, se inyectará solo mediante una variable de entorno del servicio. No se cambiará su valor. Las escrituras se limitarán a sesiones/unidades y se validarán en el servidor.

## Condición de despliegue
La documentación actual de OpenAI indica que ChatGPT requiere un servidor MCP remoto y que, para servicios privados, puede usarse Secure MCP Tunnel en productos compatibles. La compatibilidad de escritura debe comprobarse en la cuenta del usuario antes de instalar o exponer servicios.

## Plan de pruebas
1. Crear el servicio MCP aislado, sin conectarlo a producción.
2. Ejecutar pruebas unitarias de validación con datos de ejemplo.
3. Comprobar acceso de solo lectura al catálogo.
4. Probar escritura de una sesión temporal con confirmación.
5. Verificar que la sesión aparece en LUDOMUNDO y en la sincronización habitual.
6. Retirar la prueba temporal; solo después considerar despliegue.

## No implementado aún
Este documento no despliega un servidor, no cambia Docker, no modifica la API actual ni contiene credenciales.