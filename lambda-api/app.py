from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
from tensorflow import keras

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = keras.models.load_model("model.keras")
scaler = joblib.load("scaler.pkl")


class DiabetesInput(BaseModel):
    Pregnancies: float
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: float


@app.get("/")
def home():
    return {
        "message": "API de predicción de diabetes funcionando"
    }


@app.post("/predict")
def predict(data: DiabetesInput):
    input_data = np.array([[
        data.Pregnancies,
        data.Glucose,
        data.BloodPressure,
        data.SkinThickness,
        data.Insulin,
        data.BMI,
        data.DiabetesPedigreeFunction,
        data.Age
    ]])

    input_scaled = scaler.transform(input_data)

    probability = float(model.predict(input_scaled)[0][0])
    prediction = 1 if probability >= 0.5 else 0

    if prediction == 1:
        message = "Riesgo alto según el modelo académico"
    else:
        message = "Riesgo bajo según el modelo académico"

    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "message": message,
        "warning": "Este resultado es solo académico y no reemplaza una evaluación médica profesional."
    }