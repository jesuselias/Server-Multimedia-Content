# NodeJS


Objetivo:
Diseñar una aplicación para gestionar contenido multimedia accesible según los tipos de usuarios que usen la app.
1. El usuario administrador debe crear categoría de contenido: (sugerencia 3: imágenes, videos-url youtube, documentos txt)
2. El usuario administrador debe crear nueva temática:
3. Nombre de temática (ciencias, matemáticas, deporte)
4. A cada temática le da permisos de contenidos: permite imágenes, permite videos, permite textos
5. Validar que no se repitan las temáticas Validar los permisos de contenidos
6. A estas categorías se le asignarán permisos de lectura y escritura, según el tipo de usuario
registrado en la app.
Usuarios:
- Tipos de Usuarios a crear: lectores, Creadores y el Admin. Campos para registro: Alias (username), correo electrónico,
- Validar que no repitan username, y validar que no se repitan correos.
Permisos:
- Admin = CRUD
- Lector = R
- Creador = CRU
Validar permisos de usuarios durante el uso de la aplicación.
Contenido:
- Los contenidos estarán listados como una biblioteca, ordenados por tipos, y por temas.
- Cualquier usuario registrado como Lector puede acceder a ellos. Cada aporte de contenido debe
tener un “Créditos”: username
- Si no está registrado como Lector, solo mira información textual más, no puede acceder a mirar
los contenidos (videos, imágenes, textos).
- Cada categoría debe tener una imagen de portada (alusiva a su temática)
- El usuario se puede registrar como Lector, y como Creador, cualquiera de las 2 opciones.
- Validar que sea únicamente un tipo. Nunca los 2 tipos.
 Front:
- Crear una vista en la cual el usuario visitante, pueda mirar los contenidos disponibles según su temática. Listar cuantos contenidos existen: +100 imágenes, +100 videos, +100 textos (ejemplo) eso se actualiza en tiempo real cada vez que entran.
- Crear un buscador de temática.
- Crear un buscador de nombre de contenido.
- El usuario puede elegir registrarse como lector o creador.
- El creador debe poder agregar contenido según las temáticas disponibles.
- Validar que el contenido que se agrega sea el correcto según su categoría: imagen, video, texto.
- Validar que el contenido creado se ordene correctamente, por fecha de creación, y sea
disponible una vez guardado.
- Crear Endpinsts para lectura de los contenidos Crear Endpoints para lectura de datos de usuarios
- Diseño de front queda 100% a criterio de programador
- Diseño de la Base de datos queda 100% a criterio de programador usando las referencias dadas
Criterios a evaluar:
Funcionalidad
Buenas prácticas de código Validaciones de lógica
Validación de datos
Pruebas unitarias
Creación y Documentación de API Tiempo de entrega
