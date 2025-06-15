# FrontEnd - Aprobación de Proyectos

Este proyecto es una interfaz web sencilla que se comunica con una API backend para crear, buscar, editar y aprobar propuestas de proyectos.

## Uso
1. Ajusta la URL base de la API en `js/config.js` si es necesario.
2. Sirve los archivos estáticos con tu servidor preferido, por ejemplo:

```bash
npx http-server .
# o
python -m http.server 8080
```

3. Abre el navegador en la dirección indicada por el servidor y utiliza las distintas páginas:
   - `create.html` para crear proyectos.
   - `edit.html` para modificar un proyecto existente.
   - `approve.html` para registrar decisiones sobre un paso del proyecto.
   - `search.html` para buscar proyectos.

## Licencia
Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.
