# **ChessOnline Shop - Backend**

### Qué es el proyecto, con los links de ambos despliegues.

ChessOnline Shop es una tienda en línea de productos de ajedrez: tableros, piezas, relojes y libros. Empezó en la Entrega # 1 como una página estática en HTML, CSS y JavaScript, con los productos escritos a mano en un arreglo. En esta Entrega 3 se convirtió en una aplicación completa, con base de datos, usuarios y permisos.

Para cualquier visitante, sin cuenta, el sitio muestra el catálogo con los 7 productos, ahora traídos desde la base de datos. Se puede filtrar por categoría, buscar por texto o rango de precio y pasar de página. Si intenta hacer un pedido, el sitio le pide crear una cuenta o iniciar sesión.

Un usuario registrado puede hacer pedidos desde el mismo formulario de la Entrega 1: elige el producto (o lo agrega con el botón de la tarjeta), indica la cantidad y el pedido queda guardado a su nombre. En “Mis pedidos” ve solo los suyos, con fecha, cantidad, total y estado.

El administrador tiene además un panel donde crea, edita y elimina productos del catálogo, y ve los pedidos de todos los clientes.

* [Repositorio del backend](https://github.com/lu1860/chess-online-shop-backend.git)

* [URL de despliegue del backend en vercel]()

* [URL de la API desplegada]()



### Cómo correrlo en local y qué variables de entorno necesita.

Ver README del frontend

### Credenciales de prueba de un usuario `admin` y uno `user` creados por el seed (solo para el ambiente de la entrega).

Credenciales seed del backend. Son solo para el ambiente de esta entrega.

| Rol | Correo | Contraseña |
| --- | --- | --- |
| admin | `admin@chessonline.shop` | `Admin2026!` |
| user | `cliente@chessonline.shop` | `Cliente2026!` |



### 4. Cuándo 401 y cuándo 403?

* **401 (no autenticado):** La API no sabe quién eres. Pasa cuando no hay token, el token está mal firmado o vencido, o el login tiene credenciales incorrectas. Ejemplo real: DELETE /api/products/1 sin header Authorization responde 401, desde authenticate en auth.middleware.ts.

* **403 (sin permiso):** La API sí sabe quién eres, pero tu rol no puede hacer eso. Ejemplo real: la misma petición con el token de cliente@chessonline.shop responde 403, desde soloAdmin. **Bonus:** cuando el front recibe un 401 teniendo sesión, http.ts cierra la sesión y la lleva a /login?expirada=1.
