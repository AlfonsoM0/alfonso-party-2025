# Alfonso Party 2025 🎉

**Alfonso Party 2025** es una aplicación web interactiva diseñada para gestionar invitaciones y confirmaciones de asistencia para el cumpleaños de Alfonso. La aplicación incluye características como un sistema de administración para gestionar invitados, envío de correos electrónicos de confirmación y una experiencia visual atractiva para los usuarios.

## Características principales

- **Gestión de invitados**: Agrega, edita y elimina invitados desde un panel de administración.
- **Confirmación de asistencia**: Los invitados pueden confirmar su asistencia a través de la aplicación.
- **Notificaciones por correo electrónico**: Envío automático de correos electrónicos de confirmación utilizando un servidor Express.js.
- **Interfaz interactiva**: Animaciones y diseño moderno para una experiencia de usuario atractiva.

## Requisitos previos

- **Node.js** (versión 16 o superior)
- **Cuenta de Gmail** para el envío de correos electrónicos (con contraseña de aplicación habilitada).

## Configuración del proyecto

1. Clona este repositorio:

   ```bash
   git clone https://github.com/AlfonsoMO/alfonso-party-2025.git
   cd alfonso-party-2025
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

   ```env
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña_de_aplicación
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Inicia el servidor Express.js para el envío de correos electrónicos:
   ```bash
   node server.js
   ```

## Despliegue en Vercel

1. Instala la CLI de Vercel si no la tienes:

   ```bash
   npm install -g vercel
   ```

2. Inicia sesión en Vercel:

   ```bash
   vercel login
   ```

3. Despliega el proyecto:

   ```bash
   vercel
   ```

4. Configura las variables de entorno en Vercel:
   Ve a la configuración del proyecto en el panel de Vercel y agrega las mismas variables de entorno definidas en `.env.local`.

## Cómo contribuir

1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad o corrección de errores:
   ```bash
   git checkout -b mi-nueva-funcionalidad
   ```
3. Realiza tus cambios y haz un commit:
   ```bash
   git commit -m "Agrega nueva funcionalidad"
   ```
4. Sube tus cambios:
   ```bash
   git push origin mi-nueva-funcionalidad
   ```
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

¡Gracias por usar Alfonso Party 2025! 🎉
