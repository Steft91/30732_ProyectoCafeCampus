# Planificación — Avance 1 (Cafe Campus)

Documentación técnica y organizativa correspondiente al primer avance de Cafe Campus.
Se presentan la distribución de responsabilidades, arquitectura implementada, patrones de diseño aplicados y el análisis experimental de latencia y acoplamiento temporal.

Equipo de 3 integrantes: **Marcos Escobar**, **Mateo Sosa** y **Stefany Díaz**. 
| Documento | Contenido |
|---|---|
| [`arquitectura-avance1.puml`](arquitectura-avance1.puml) | **Fuente** del diagrama de arquitectura (PlantUML): camino síncrono TCP vs asíncrono Redis. |
| [`arquitectura-avance1.png`](arquitectura-avance1.png) · [`.svg`](arquitectura-avance1.svg) | Diagrama **exportado** (el PNG es el que se enlaza en el README). |
| [`01-roles-y-kanban.md`](01-roles-y-kanban.md) | Roles, propiedad por directorio y reparto de tarjetas Kanban. |
| [`02-patrones-y-principios.md`](02-patrones-y-principios.md) | Patrones/principios aplicados (framework vs equipo) — criterio C3. |
| [`03-analisis-latencia-acoplamiento.md`](03-analisis-latencia-acoplamiento.md) | Análisis empírico de latencia y acoplamiento — criterio C2. |

## Cómo regenerar el diagrama

El PNG/SVG ya están exportados y versionados. Si se edita el `.puml`, **hay que regenerarlos**:

```bash
# Requiere: plantuml + java + graphviz (dot)
plantuml -tpng docs/planificacion-avance1/arquitectura-avance1.puml
plantuml -tsvg docs/planificacion-avance1/arquitectura-avance1.puml
```

Alternativas: extensión *PlantUML* en VS Code (`Alt+D` para previsualizar) o pegar el contenido
en <https://www.plantuml.com/plantuml>.

## Secuencia de trabajo en una frase

Marcos funda el monorepo → los tres construyen sus servicios en paralelo (directorios disjuntos,
cero conflictos) → Stefany documenta y mide con el stack completo → Marcos etiqueta `v1-avance1`.
