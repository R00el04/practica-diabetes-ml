# Practica 04 - Maldad pedagogica

Sistema academico de prediccion orientativa de diabetes construido con una arquitectura de extremo a extremo:

`Dataset medico -> Modelo ML con Keras + Adam -> API de inferencia FastAPI -> Frontend Next.js -> Resultado relevante para el usuario`

## Descripcion

El proyecto implementa una practica universitaria donde se entrena una red neuronal con TensorFlow/Keras sobre el dataset `diabetes.csv`, se publica el modelo como API de inferencia en FastAPI y se consume desde un frontend web preparado para ejecutarse localmente y desplegarse en Vercel.

Aunque el requerimiento menciona "Lambda", en esta solucion ese rol se implementa como una **API de inferencia con FastAPI**: recibe datos, consulta el modelo ML y devuelve una prediccion con contexto legible.

## Arquitectura

1. `ml/`
   Entrenamiento del modelo y generacion de artefactos `model.keras`, `scaler.pkl` y `model_info.json`.
2. `lambda-api/`
   Backend FastAPI que carga el modelo y expone `/predict`, `/health` y `/model-info`.
3. `frontend/`
   Aplicacion Next.js que envia las 8 variables medicas al backend y muestra el resultado de forma visual.

## Tecnologias usadas

- Python 3.10
- TensorFlow / Keras
- Scikit-learn
- FastAPI
- Uvicorn
- Next.js 16
- React 19
- Tailwind CSS 4
- Render para backend
- Vercel para frontend

## Estructura de carpetas

```text
practica-diabetes-ml/
├── frontend/
├── lambda-api/
├── ml/
├── GUIA_EJECUCION_LOCAL.md
├── GUIA_DESPLIEGUE_RENDER_VERCEL.md
├── INFORME_PRACTICA_04.md
├── README.md
└── render.yaml
```

## Variables medicas utilizadas

- `Pregnancies`
- `Glucose`
- `BloodPressure`
- `SkinThickness`
- `Insulin`
- `BMI`
- `DiabetesPedigreeFunction`
- `Age`

Variable objetivo:

- `Outcome`

## Dataset

El archivo `ml/diabetes.csv` contiene registros clinicos utilizados para una tarea de clasificacion binaria: estimar si un caso pertenece o no a la clase positiva de diabetes.

## Modelo Keras con Adam

El entrenamiento usa:

- `train_test_split`
- `StandardScaler`
- red neuronal densa para clasificacion binaria
- optimizador `Adam`
- funcion de perdida `binary_crossentropy`
- metrica `accuracy`

El script tambien muestra:

- accuracy final
- matriz de confusion
- `classification_report`

## Nota sobre preprocesamiento clinico

En esta practica **no se realiza limpieza clinica avanzada de valores cero o atipicos**, porque el objetivo principal es demostrar el flujo completo `ML + API + Frontend`.

En un proyecto real, seria necesario revisar:

- ceros implausibles en variables clinicas
- tratamiento de outliers
- analisis de sesgo
- calibracion del modelo
- validacion clinica mas estricta

## Flujo de entrenamiento

```bash
cd ml
python train_model.py
```

El script:

1. valida el dataset
2. entrena el modelo
3. guarda `model.keras`
4. guarda `scaler.pkl`
5. genera `model_info.json`
6. copia automaticamente esos artefactos a `lambda-api/`

## Flujo de prediccion

Entrada oficial del backend:

```json
{
  "pregnancies": 2,
  "glucose": 120,
  "bloodPressure": 70,
  "skinThickness": 20,
  "insulin": 79,
  "bmi": 25.5,
  "diabetesPedigreeFunction": 0.5,
  "age": 33
}
```

Orden interno del modelo:

```text
Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age
```

## Guias practicas

- Ejecucion local paso a paso: [GUIA_EJECUCION_LOCAL.md](<D:/PC-Tecnologias/practica-diabetes-ml/GUIA_EJECUCION_LOCAL.md>)
- Despliegue backend Render + frontend Vercel: [GUIA_DESPLIEGUE_RENDER_VERCEL.md](<D:/PC-Tecnologias/practica-diabetes-ml/GUIA_DESPLIEGUE_RENDER_VERCEL.md>)

## Ejecucion rapida en local

### 1. Reentrenar el modelo

```bash
cd ml
python train_model.py
```

### 2. Levantar backend

```bash
cd lambda-api
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt --timeout 100 --retries 10
uvicorn app:app --reload
```

### 3. Levantar frontend

Crear `frontend/.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Luego:

```bash
cd frontend
npm install
npm run dev
```

### URLs locales

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`
- Docs backend: `http://127.0.0.1:8000/docs`
- Health backend: `http://127.0.0.1:8000/health`

## Despliegue

### Frontend en Vercel

Variable principal:

```env
NEXT_PUBLIC_API_URL=https://URL-DEL-BACKEND
```

### Backend en Render

Variables recomendadas:

```env
PYTHON_VERSION=3.10.11
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

Comando de instalacion:

```bash
python -m pip install -r requirements.txt --timeout 100 --retries 10
```

Comando de inicio:

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```

## Alternativas de despliegue del backend

Si TensorFlow genera problemas de peso, memoria o arranque en Render, se pueden considerar estas alternativas:

- Railway
- Hugging Face Spaces
- backend local expuesto con ngrok

## Artefactos ML en GitHub

Actualmente `model.keras` y `scaler.pkl` son pequenos, por lo que es razonable versionarlos junto con `model_info.json`.

Si en el futuro el modelo crece demasiado, el flujo recomendado seria:

1. subir solo el codigo
2. regenerar artefactos con `python train_model.py`
3. copiar los archivos al backend antes de correr o desplegar

## URLs para completar

- URL Frontend Vercel:
- URL Backend Render:
- Repositorio GitHub:

## Advertencia medica

**Este sistema es solo una practica academica y no reemplaza el diagnostico de un profesional de salud.**
