# MotorLab · servidor de vídeos en UGREEN

Este proyecto crea un servidor NGINX muy pequeño para que MotorLab pueda reproducir vídeos almacenados en el NAS.

## 1. Preparar la carpeta

En el mismo directorio donde esté este `docker-compose.yml`, crea:

```
videos/
```

Copia dentro los vídeos que quieras utilizar en MotorLab.

Ejemplo:

```
videos/
  calentamiento.mp4
  relevos.mp4
  cooperacion.mp4
```

La aplicación no copia los vídeos a GitHub ni a la memoria del navegador: guarda solamente la URL del vídeo.

## 2. Desplegar en UGREEN

En UGOS Pro:

1. Abre **Docker → Project → Create**.
2. Crea un proyecto llamado `motorlab-videos`.
3. Pega el contenido de `docker-compose.yml` en la configuración Compose.
4. Asegúrate de que `nginx.conf` y la carpeta `videos` estén en la carpeta del proyecto.
5. Pulsa **Deploy**.
6. Comprueba que el contenedor `motorlab-videos` aparece como activo.

El servidor escuchará internamente en el puerto 80 y en el NAS se publicará en el **8091**.

## 3. Publicarlo por Tailscale con HTTPS

MotorLab está publicado por HTTPS, por lo que no debemos introducir una URL HTTP del NAS en la ficha del juego. La forma recomendada es dejar NGINX en HTTP dentro del NAS y hacer que Tailscale termine HTTPS.

En el NAS, si tienes acceso a la CLI de Tailscale:

```bash
tailscale serve 8091
```

Tailscale Serve crea una URL HTTPS privada dentro de tu tailnet y reenvía las peticiones al servicio local del puerto 8091.

Comprueba la configuración con:

```bash
tailscale serve status
```

No uses **Funnel** para esta biblioteca salvo que quieras hacer los vídeos públicos en Internet.

## 4. URL que se introduce en MotorLab

Si Tailscale te muestra, por ejemplo:

```
https://mi-nas.mi-tailnet.ts.net
```

y el archivo se llama `calentamiento.mp4`, en MotorLab se introduce:

```
https://mi-nas.mi-tailnet.ts.net/videos/calentamiento.mp4
```

Si el nombre contiene espacios, es preferible renombrarlo usando guiones o guiones bajos.

## 5. Prueba antes de añadir el vídeo a MotorLab

Abre directamente la URL del vídeo en Safari/Chrome desde el iPhone/iPad/ordenador que tenga acceso a Tailscale.

Si el navegador reproduce el MP4, MotorLab podrá utilizar esa URL. El servidor además envía CORS y permite peticiones Range, necesarias para que el navegador pueda obtener una miniatura desde el vídeo y para buscar dentro del vídeo.

## Seguridad

La carpeta de vídeos se monta como **solo lectura** (`:ro`). El contenedor no puede modificar ni borrar los vídeos del NAS.

No expongas el puerto 8091 directamente a Internet. Usa Tailscale Serve para mantener el acceso dentro de tu tailnet.
