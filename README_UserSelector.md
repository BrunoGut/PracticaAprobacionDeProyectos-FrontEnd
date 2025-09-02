# Selector de Usuario

Este documento describe la funcionalidad del selector de usuario implementado para el sistema de gestión de proyectos.

## Funcionalidad

El selector de usuario permite:
- Seleccionar el usuario activo que realizará acciones en el sistema
- Cargar dinámicamente la lista de usuarios desde el backend
- Mantener el usuario seleccionado entre navegaciones
- Usar automáticamente el usuario seleccionado como creador de proyectos
- Usar automáticamente el usuario seleccionado como aprobador en decisiones

## Archivos Creados/Modificados

### Nuevos Archivos

1. **`src/components/userSelector.js`**
   - Lógica del selector de usuario
   - Carga dinámica de usuarios desde `/api/User`
   - Funciones para obtener/establecer usuario actual
   - Renderizado del dropdown de usuarios
   - Normalización de datos de usuario del backend

2. **`css/userSelector.css`**
   - Estilos para el selector de usuario en la navegación
   - Diseño responsive del dropdown
   - Animaciones y estados visuales

### Archivos Modificados

1. **`src/nav.js`**
   - Integración del selector de usuario en la navegación
   - Ajuste de layout para acomodar el nuevo componente

2. **`src/create.js`**
   - Eliminación del campo manual de selección de usuario
   - Uso automático del usuario seleccionado como creador
   - Actualización visual cuando cambia el usuario

3. **`create.html`**
   - Actualización del formulario para mostrar usuario fijo
   - Inclusión de archivos CSS y JS necesarios

4. **`src/approve.js`**
   - Integración del usuario seleccionado como aprobador
   - Display visual del usuario que tomará la decisión
   - Envío automático del ID del usuario en aprobaciones
   - Eliminación de carga duplicada de usuarios

5. **`approve.html`**
   - Agregado de campo visual para mostrar usuario aprobador
   - Inclusión de archivos CSS y JS necesarios

6. **`src/forms.js`**
   - Agregado soporte para `beforeSubmit` callback
   - Permite modificar datos antes del envío

7. **`css/forms.css`**
   - Estilos para campos de usuario personalizados
   - Diseño coherente con el resto del sistema

8. **Todas las páginas HTML**
   - Inclusión de `userSelector.css` y `userSelector.js`
   - Actualización de imports para mantener funcionalidad

## Uso

### Selección de Usuario
1. En la barra de navegación, aparece un dropdown con el usuario actual
2. Al hacer clic, se muestra la lista de usuarios disponibles cargada desde el backend
3. Seleccionar un usuario lo establece como activo
4. El usuario seleccionado se mantiene entre navegaciones (localStorage)

### Creación de Proyectos
- Al crear un proyecto, el usuario seleccionado se asigna automáticamente como creador
- No es necesario seleccionar usuario manualmente en el formulario
- Se muestra visualmente qué usuario está creando el proyecto

### Aprobación de Proyectos
- Al aprobar/rechazar proyectos, el usuario seleccionado se registra como quien toma la decisión
- Se muestra visualmente qué usuario está tomando la decisión
- Los datos del aprobador se envían automáticamente con la decisión

## Carga de Usuarios

Los usuarios se cargan dinámicamente desde el endpoint `/api/User`. El sistema:
- Hace un fetch a `/api/User` al inicializarse
- Normaliza los datos recibidos para asegurar consistencia
- Maneja campos como `name`, `fullName`, `title`, `username`, `email`
- Proporciona valores por defecto para campos faltantes
- Maneja errores de conexión mostrando estado de "Cargando..."

### Estructura de Usuario Esperada

El backend puede devolver usuarios con cualquiera de estas estructuras:
```json
{
  "id": 1,
  "name": "Usuario Nombre",           // o fullName, title, username, email
  "role": "Rol del Usuario",          // o position, department
  "email": "usuario@email.com"        // o mail
}
```

## Extensibilidad

Para modificar la normalización de datos de usuario:
1. Editar la función `loadUsersFromBackend()` en `src/components/userSelector.js`
2. Ajustar el mapeo de campos según la estructura de tu backend

Para agregar funcionalidad adicional:
1. Los eventos `userChanged` se disparan cuando cambia el usuario
2. Usar `getCurrentUser()` para obtener el usuario actual en cualquier momento
3. Usar `getAllUsers()` para obtener la lista completa de usuarios
