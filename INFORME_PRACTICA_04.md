# Práctica 04 - Maldad pedagógica

## Carátula

**Curso:** ______________________________________

**Docente:** ____________________________________

**Integrantes:**

- ______________________________________________
- ______________________________________________
- ______________________________________________

**Fecha:** ______________________________________

## Introducción

La presente práctica desarrolla un sistema académico de predicción orientativa de diabetes que integra entrenamiento de un modelo de Machine Learning, publicación del modelo mediante una API y consumo desde un frontend web.

## Objetivo general

Construir una solución completa que conecte un dataset médico con un modelo entrenado en Keras, una API de inferencia y una interfaz web capaz de mostrar resultados relevantes al usuario.

## Objetivos específicos

- Entrenar un modelo de clasificación binaria con Keras y optimizador Adam.
- Publicar el modelo mediante una API desarrollada con FastAPI.
- Construir un frontend que consuma la API y visualice el resultado.
- Preparar la solución para ejecución local y despliegue en la nube.

## Arquitectura del sistema

```text
Dataset diabetes.csv
        ↓
Entrenamiento ML con Keras + Adam
        ↓
Artefactos: model.keras + scaler.pkl + model_info.json
        ↓
API FastAPI /predict
        ↓
Frontend Next.js
        ↓
Resultado orientativo para el usuario
```

## Descripción del dataset

Se utiliza el dataset `diabetes.csv`, que contiene variables clínicas empleadas para estimar riesgo de diabetes.

Variables de entrada:

- Pregnancies
- Glucose
- BloodPressure
- SkinThickness
- Insulin
- BMI
- DiabetesPedigreeFunction
- Age

Variable objetivo:

- Outcome

## Descripción del modelo ML

El modelo corresponde a una red neuronal densa para clasificación binaria. El proceso incluye:

- separación entre variables predictoras y objetivo,
- división en entrenamiento y prueba con `train_test_split`,
- escalado con `StandardScaler`,
- entrenamiento con Keras,
- optimizador Adam,
- función de pérdida `binary_crossentropy`,
- evaluación con accuracy, matriz de confusión y `classification_report`.

Nota: esta práctica no incluye limpieza clínica avanzada de valores cero o atípicos. En un proyecto real, esa mejora sería necesaria.

## Backend Lambda/API

El backend se implementa con FastAPI y cumple el rol de componente “lambda” de inferencia:

- recibe datos de entrada,
- aplica el mismo scaler del entrenamiento,
- consulta el modelo `model.keras`,
- devuelve una respuesta JSON con predicción, probabilidad, nivel de riesgo y advertencia médica.

Endpoints principales:

- `GET /`
- `GET /health`
- `GET /model-info`
- `POST /predict`

## Frontend

El frontend se desarrolla con Next.js y React. Incluye:

- formulario con las 8 variables del dataset,
- validación básica de entrada,
- consumo del backend mediante `NEXT_PUBLIC_API_URL`,
- visualización de predicción, probabilidad, nivel de riesgo y mensaje orientativo.

## Pruebas locales

### Reentrenamiento

```bash
cd ml
python train_model.py
```

### Backend

```bash
cd lambda-api
venv\Scripts\activate
uvicorn app:app --reload
```

### Frontend

```bash
cd frontend
npm run dev
```

URLs de validación:

- Frontend: `http://localhost:3000`
- Backend docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

## Despliegue

### Frontend

Se prepara para despliegue en Vercel usando la variable:

```env
NEXT_PUBLIC_API_URL=https://URL-DEL-BACKEND
```

### Backend

La opción principal propuesta es Render, con alternativas como Railway, Hugging Face Spaces o exponer backend local con ngrok si TensorFlow genera problemas de peso o memoria.

## Conclusiones

- Se logró integrar entrenamiento, inferencia y visualización en una sola solución.
- La arquitectura permite demostrar el flujo completo de una aplicación de Machine Learning aplicada.
- El sistema es útil como práctica académica, aunque no debe interpretarse como herramienta clínica real.

## Enlaces

- GitHub:
- Vercel:
- Backend:
