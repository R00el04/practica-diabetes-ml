# Guia de despliegue en Render + Vercel

Esta guia despliega:

- backend FastAPI en **Render**
- frontend Next.js en **Vercel**

Y deja ambos conectados correctamente por variable de entorno y CORS.

## Arquitectura final

```text
Usuario
  ->
Frontend Vercel
  ->
API FastAPI en Render
  ->
Modelo Keras + scaler
```

## Requisitos previos

- Repositorio subido a GitHub
- Cuenta en Render
- Cuenta en Vercel
- Proyecto funcionando en local

Antes de desplegar, verifica localmente:

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\frontend
npm run build
```

Y confirma que el backend tenga artefactos actualizados:

```text
lambda-api/model.keras
lambda-api/scaler.pkl
lambda-api/model_info.json
```

## Parte A. Desplegar el backend en Render

## 1. Confirmar archivos necesarios

El backend depende de:

- `lambda-api/app.py`
- `lambda-api/requirements.txt`
- `lambda-api/model.keras`
- `lambda-api/scaler.pkl`
- `lambda-api/model_info.json`
- `render.yaml`

Si falta alguno de los artefactos del modelo:

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\ml
..\lambda-api\venv\Scripts\python.exe train_model.py
```

## 2. Subir cambios a GitHub

Render y Vercel desplegaran desde tu repositorio.

## 3. Crear el servicio en Render

En Render:

1. Entra a tu dashboard
2. Pulsa `New +`
3. Elige `Web Service`
4. Conecta tu repositorio de GitHub
5. Selecciona este proyecto

## 4. Configuracion recomendada del servicio

Usa estos valores:

- **Root Directory**: `lambda-api`
- **Environment**: `Python 3`
- **Build Command**:

```bash
python -m pip install -r requirements.txt --timeout 100 --retries 10
```

- **Start Command**:

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```

Tambien puedes usar el archivo [render.yaml](<D:/PC-Tecnologias/practica-diabetes-ml/render.yaml>) para simplificar la configuracion.

## 5. Variables de entorno en Render

Al inicio configura al menos:

```env
PYTHON_VERSION=3.10.11
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

Como al principio aun no conoceras la URL final de Vercel, puedes empezar temporalmente con:

```env
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,http://localhost:3000,http://127.0.0.1:3000
```

Despues la ajustas con la URL real.

## 6. Esperar el primer deploy

Cuando Render termine:

1. abre la URL del servicio, por ejemplo:
   - `https://tu-backend.onrender.com`
2. prueba:
   - `/`
   - `/health`
   - `/docs`
   - `/model-info`

Ejemplos:

- `https://tu-backend.onrender.com/health`
- `https://tu-backend.onrender.com/docs`

## 7. Si Render falla

Revisa en logs:

- errores de instalacion de TensorFlow
- memoria insuficiente
- falta de artefactos del modelo
- problema con el puerto o el start command

Si TensorFlow causa demasiado peso o consumo, considera estas alternativas:

- Railway
- Hugging Face Spaces
- backend local expuesto con ngrok

## Parte B. Desplegar el frontend en Vercel

## 1. Crear proyecto en Vercel

En Vercel:

1. entra a tu dashboard
2. pulsa `Add New...`
3. elige `Project`
4. importa el mismo repositorio de GitHub

## 2. Configurar el directorio correcto

Como el frontend vive en una subcarpeta, configura:

- **Root Directory**: `frontend`

Vercel detectara Next.js automaticamente.

## 3. Configurar variable de entorno del frontend

Antes de desplegar, agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

Esta variable debe apuntar a la URL publica del backend en Render, sin `/predict`.

Ejemplo correcto:

```env
NEXT_PUBLIC_API_URL=https://practica-diabetes-ml-api.onrender.com
```

Ejemplo incorrecto:

```env
NEXT_PUBLIC_API_URL=https://practica-diabetes-ml-api.onrender.com/predict
```

## 4. Desplegar el frontend

Lanza el deploy desde Vercel.

Cuando termine, obtendras una URL como:

```text
https://tu-frontend.vercel.app
```

## Parte C. Conectar correctamente Vercel con Render

Este paso es importante porque el frontend ya conoce el backend, pero el backend tambien debe permitir el dominio del frontend mediante CORS.

## 1. Copiar la URL final de Vercel

Ejemplo:

```text
https://practica-diabetes-ml.vercel.app
```

## 2. Actualizar `ALLOWED_ORIGINS` en Render

Ve al servicio backend en Render y edita la variable:

```env
ALLOWED_ORIGINS=https://practica-diabetes-ml.vercel.app,http://localhost:3000,http://127.0.0.1:3000
```

Si no necesitas ya los origenes locales en produccion, puedes dejar solo:

```env
ALLOWED_ORIGINS=https://practica-diabetes-ml.vercel.app
```

## 3. Guardar y redeployar

Tras cambiar variables de entorno en Render:

1. guarda cambios
2. espera el redeploy
3. vuelve a probar el frontend en Vercel

## Parte D. Prueba final de integracion

Con ambos servicios desplegados:

1. abre el frontend en Vercel
2. usa `Cargar ejemplo` o llena el formulario manualmente
3. pulsa `Calcular riesgo`
4. verifica que el resultado aparezca sin errores de CORS ni de red

## Checklist final

### Backend Render

- [ ] `https://tu-backend.onrender.com/health` responde `ok`
- [ ] `https://tu-backend.onrender.com/docs` carga
- [ ] `model.keras` y `scaler.pkl` estaban incluidos en el deploy
- [ ] `ALLOWED_ORIGINS` contiene la URL de Vercel

### Frontend Vercel

- [ ] el proyecto usa `Root Directory = frontend`
- [ ] `NEXT_PUBLIC_API_URL` apunta a Render
- [ ] el formulario envia datos y recibe respuesta

## Problemas comunes

## 1. El frontend muestra error de red

Revisa:

- que `NEXT_PUBLIC_API_URL` sea la URL correcta de Render
- que Render este en estado `Live`
- que `ALLOWED_ORIGINS` incluya el dominio de Vercel

## 2. Error de CORS

Normalmente significa que olvidaste actualizar:

```env
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

## 3. Render arranca pero falla al predecir

Revisa:

- que `model.keras` exista en `lambda-api/`
- que `scaler.pkl` exista en `lambda-api/`
- que `model_info.json` exista en `lambda-api/`
- que `/model-info` no reporte `model_ready: false`

## 4. Vercel despliega pero apunta al backend equivocado

Revisa `NEXT_PUBLIC_API_URL` en:

- Project Settings
- Environment Variables

Y luego redeploya el frontend.

## 5. TensorFlow causa problemas de memoria o build

Alternativas recomendadas:

- Railway
- Hugging Face Spaces
- backend local con ngrok para demo academica

## Orden recomendado de despliegue

1. Reentrenar modelo y confirmar artefactos
2. Subir cambios a GitHub
3. Desplegar backend en Render
4. Obtener URL publica de Render
5. Crear frontend en Vercel
6. Configurar `NEXT_PUBLIC_API_URL` con la URL de Render
7. Obtener URL final de Vercel
8. Actualizar `ALLOWED_ORIGINS` en Render con esa URL
9. Redeployar y probar integracion final

## URLs para completar

- Backend Render:
- Frontend Vercel:
- Repositorio GitHub:
