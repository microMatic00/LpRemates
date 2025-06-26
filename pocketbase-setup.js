// Instrucciones para configurar las colecciones en PocketBase

/*
Para que la aplicación funcione correctamente, necesitas crear manualmente las siguientes colecciones en PocketBase:

1. Colección "auctions" con los siguientes campos:
   - title (text, requerido)
   - image (file)
   - current_price (number, requerido)
   - end_time (datetime, requerido)
   - user (relation, requerido, apunta a la colección "users")

   IMPORTANTE - REGLAS DE API para "auctions":
   - List/Search rule: déjalo vacío para permitir a todos ver las subastas
   - View rule: déjalo vacío para permitir a todos ver los detalles de las subastas
   - Create rule: "@request.auth.id != ''" (para permitir solo a usuarios autenticados crear subastas)
   - Update rule: "@request.auth.id = user.id" (para permitir actualización solo al creador de la subasta)
   - Delete rule: "@request.auth.id = user.id" (para permitir eliminación solo al creador de la subasta)

2. Colección "bids" con los siguientes campos:
   - auction (relation, requerido, apunta a la colección "auctions")
   - user (relation, requerido, apunta a la colección "users")
   - amount (number, requerido)
   - created (datetime, requerido)

   IMPORTANTE - REGLAS DE API para "bids":
   - List/Search rule: déjalo vacío para permitir a todos ver las pujas
   - View rule: déjalo vacío para permitir a todos ver los detalles de las pujas
   - Create rule: "@request.auth.id != ''" (para permitir solo a usuarios autenticados crear pujas)
   - Update rule: "@request.auth.id = user.id" (para permitir actualización solo al creador de la puja)
   - Delete rule: "@request.auth.id = user.id" (para permitir eliminación solo al creador de la puja)

Pasos para configurar PocketBase:
1. Descarga PocketBase desde https://pocketbase.io/docs/ si aún no lo has hecho
2. Ejecuta el servidor PocketBase con `./pocketbase serve` (o equivalente para Windows)
3. Accede al panel de administración en http://127.0.0.1:8090/_/
4. Crea las colecciones mencionadas arriba con los campos y reglas de API sugeridas
5. Crea al menos un usuario para poder probar las pujas
6. Crea algunas subastas de prueba con fechas de finalización en el futuro

ERRORES COMUNES:
- Error 404 "Missing collection context": Significa que la colección no existe o no tienes permiso para acceder a ella.
  Solución: Verifica que las colecciones estén creadas y que las reglas de API de "List/Search" y "View" estén vacías.

- Error 401 "Unauthorized": Significa que estás intentando realizar una acción que requiere autenticación.
  Solución: Asegúrate de haber iniciado sesión antes de intentar crear o modificar registros.

Una vez configurado PocketBase con las reglas correctas, tu aplicación React podrá conectarse correctamente.
*/

// Este archivo es solo informativo y no necesita ser importado en ninguna parte de la aplicación

/*
NOTA SOBRE PERMISOS DE ADMINISTRADOR:

Si deseas permitir que ciertos usuarios tengan permisos de administrador para modificar o eliminar
cualquier subasta o puja (no solo las suyas), deberías:

1. Crear un campo booleano llamado "is_admin" en la colección "users"
2. Modificar las reglas de API para incluir esta verificación:

   Para "auctions":
   - Update rule: "@request.auth.id = user.id || @request.auth.isAdmin = true"
   - Delete rule: "@request.auth.id = user.id || @request.auth.isAdmin = true"

   Para "bids":
   - Update rule: "@request.auth.id = user.id || @request.auth.isAdmin = true"
   - Delete rule: "@request.auth.id = user.id || @request.auth.isAdmin = true"

3. Marcar como "true" el campo "is_admin" para los usuarios que desees que sean administradores

Esta configuración es opcional y solo es necesaria si quieres tener usuarios con privilegios especiales.
*/
