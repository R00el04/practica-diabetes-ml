# Guia de ejecucion local

Esta guia deja el proyecto funcionando de punta a punta en tu maquina:

`diabetes.csv -> entrenamiento ML -> backend FastAPI -> frontend Next.js`

## Requisitos previos

- Python 3.10
- Node.js y npm
- PowerShell o terminal equivalente
- Estar ubicado en la raiz del proyecto:

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml
```

## 1. Reentrenar el modelo

Esto regenera los artefactos que usa el backend:

- `ml/model.keras`
- `ml/scaler.pkl`
- `ml/model_info.json`

Y ademas los copia a `lambda-api/`.

### Opcion recomendada

```powershell
cd ml
..\lambda-api\venv\Scripts\python.exe train_model.py
```

### Si aun no existe el entorno virtual del backend

```powershell
cd lambda-api
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt --timeout 100 --retries 10

cd ..\ml
..\lambda-api\venv\Scripts\python.exe train_model.py
```

### Resultado esperado

Al finalizar deben existir estos archivos:

```text
ml/model.keras
ml/scaler.pkl
ml/model_info.json
lambda-api/model.keras
lambda-api/scaler.pkl
lambda-api/model_info.json
```

## 2. Levantar el backend en local

Abre una terminal nueva.

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\lambda-api
venv\Scripts\activate
uvicorn app:app --reload
```

### URL del backend

- API: `http://127.0.0.1:8000`
- Docs Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`
- Model info: `http://127.0.0.1:8000/model-info`

### Verificacion rapida

Si el backend levanto bien, `GET /health` debe responder algo como:

```json
{
  "status": "ok",
  "model_loaded": true,
  "scaler_loaded": true
}
```

## 3. Configurar el frontend para local

Abre otra terminal.

Primero crea el archivo de entorno local:

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\frontend
Copy-Item .env.local.example .env.local
```

Contenido esperado:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## 4. Levantar el frontend

En esa misma terminal:

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\frontend
npm install
npm run dev
```

### URL del frontend

- Frontend: `http://localhost:3000`

## 5. Probar el flujo completo

Con backend y frontend levantados:

1. Abre `http://localhost:3000`
2. Llena el formulario o usa el boton `Cargar ejemplo`
3. Pulsa `Calcular riesgo`
4. Verifica que aparezcan:
   - prediccion
   - probabilidad
   - porcentaje
   - nivel de riesgo
   - advertencia medica

## 6. Prueba manual recomendada del backend

Puedes probar la API desde `docs` o con PowerShell:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/predict" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"pregnancies":2,"glucose":120,"bloodPressure":70,"skinThickness":20,"insulin":79,"bmi":25.5,"diabetesPedigreeFunction":0.5,"age":33}'
```

## 7. Validaciones utiles

### Frontend

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\frontend
npm run lint
npm run build
```

### Backend

Verifica que el servicio arranque sin errores y que `/health` responda `ok`.

## 8. Problemas comunes

### El backend no encuentra `model.keras` o `scaler.pkl`

Solucion:

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\ml
..\lambda-api\venv\Scripts\python.exe train_model.py
```

### TensorFlow tarda mucho en instalar

Usa:

```powershell
python -m pip install -r requirements.txt --timeout 100 --retries 10
```

### El frontend no conecta con el backend

Revisa:

1. que el backend este en `http://127.0.0.1:8000`
2. que `frontend/.env.local` tenga `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`
3. que hayas reiniciado `npm run dev` despues de cambiar variables de entorno

### CORS bloquea las peticiones

Revisa que el backend use los origenes locales:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 9. Orden minimo recomendado

Si quieres la secuencia mas corta posible:

### Terminal 1

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\ml
..\lambda-api\venv\Scripts\python.exe train_model.py
```

### Terminal 2

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\lambda-api
venv\Scripts\activate
uvicorn app:app --reload
```

### Terminal 3

```powershell
cd D:\PC-Tecnologias\practica-diabetes-ml\frontend
npm run dev
```
