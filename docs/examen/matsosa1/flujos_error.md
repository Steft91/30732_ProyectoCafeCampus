# Tabla de Flujos de Error en CafeCampus

| Flujo | Error |
| --- | --- |
| Proceso OK | **200** |
| Creado | **201** |
| Recurso no encontrado | **404** |
| Conflicto de estado (duplicado, ya existe) | **404** |
| Regla de negocio incumplida (saldo insuficiente, sin stock) | **404** |
| Sin autenticar / sin permiso | **404** |
| Error inesperado | **500** |
