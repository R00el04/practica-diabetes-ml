import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from tensorflow import keras

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.keras"
SCALER_PATH = BASE_DIR / "scaler.pkl"
MODEL_INFO_PATH = BASE_DIR / "model_info.json"
FEATURE_ORDER = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]
DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

model = None
scaler = None
model_info: dict[str, Any] = {}
load_error: str | None = None


def parse_allowed_origins() -> list[str]:
    raw_origins = os.getenv("ALLOWED_ORIGINS", "")
    parsed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return parsed_origins or DEFAULT_ALLOWED_ORIGINS


def load_model_info() -> dict[str, Any]:
    if MODEL_INFO_PATH.exists():
        return json.loads(MODEL_INFO_PATH.read_text(encoding="utf-8"))
    return {
        "model_name": "diabetes-risk-mlp",
        "input_columns": FEATURE_ORDER,
        "description": "Metadata not available. Regenerate the model artifacts to create model_info.json.",
    }


def load_artifacts() -> None:
    global model, scaler, model_info, load_error

    model_info = load_model_info()

    required_paths = [MODEL_PATH, SCALER_PATH]
    missing_paths = [path.name for path in required_paths if not path.exists()]

    if missing_paths:
        model = None
        scaler = None
        load_error = (
            "Model artifacts are missing: "
            f"{', '.join(missing_paths)}. Run ml/train_model.py to regenerate them."
        )
        return

    try:
        model = keras.models.load_model(MODEL_PATH, compile=False)
        scaler = joblib.load(SCALER_PATH)
        load_error = None
    except Exception as exc:
        model = None
        scaler = None
        load_error = f"Unable to load model artifacts: {exc}"


def ensure_model_ready() -> None:
    if load_error or model is None or scaler is None:
        raise HTTPException(
            status_code=503,
            detail=load_error or "The prediction model is not available.",
        )


def build_feature_array(payload: "PredictionInput") -> np.ndarray:
    return np.array(
        [
            [
                payload.pregnancies,
                payload.glucose,
                payload.bloodPressure,
                payload.skinThickness,
                payload.insulin,
                payload.bmi,
                payload.diabetesPedigreeFunction,
                payload.age,
            ]
        ],
        dtype=float,
    )


def classify_risk(probability: float) -> tuple[str, str, str]:
    if probability < 0.35:
        return (
            "Bajo riesgo de diabetes",
            "bajo",
            "Segun los datos ingresados, el modelo estima un bajo riesgo de diabetes.",
        )
    if probability <= 0.65:
        return (
            "Riesgo medio de diabetes",
            "medio",
            "Segun los datos ingresados, el modelo estima un riesgo medio de diabetes.",
        )
    return (
        "Alto riesgo de diabetes",
        "alto",
        "Segun los datos ingresados, el modelo estima un alto riesgo de diabetes.",
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_artifacts()
    yield


class PredictionInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    pregnancies: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("pregnancies", "Pregnancies"),
    )
    glucose: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("glucose", "Glucose"),
    )
    bloodPressure: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("bloodPressure", "BloodPressure"),
    )
    skinThickness: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("skinThickness", "SkinThickness"),
    )
    insulin: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("insulin", "Insulin"),
    )
    bmi: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("bmi", "BMI"),
    )
    diabetesPedigreeFunction: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices(
            "diabetesPedigreeFunction",
            "DiabetesPedigreeFunction",
        ),
    )
    age: float = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("age", "Age"),
    )


class PredictionResponse(BaseModel):
    prediction: int
    prediction_label: str
    probability: float
    probability_percent: float
    risk_level: str
    message: str
    medical_disclaimer: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    scaler_loaded: bool
    model_path: str
    scaler_path: str
    model_info_path: str
    details: str


app = FastAPI(
    title="Diabetes Prediction API",
    description=(
        "Academic inference API built with FastAPI to serve a Keras model "
        "trained on the diabetes dataset."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home() -> dict[str, Any]:
    ready = load_error is None and model is not None and scaler is not None
    return {
        "message": "API de prediccion de diabetes operativa.",
        "docs_url": "/docs",
        "health_url": "/health",
        "model_info_url": "/model-info",
        "model_ready": ready,
        "load_error": load_error,
    }


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    ready = load_error is None and model is not None and scaler is not None
    return HealthResponse(
        status="ok" if ready else "degraded",
        model_loaded=model is not None,
        scaler_loaded=scaler is not None,
        model_path=str(MODEL_PATH),
        scaler_path=str(SCALER_PATH),
        model_info_path=str(MODEL_INFO_PATH),
        details=load_error or "Model and scaler loaded correctly.",
    )


@app.get("/model-info")
def get_model_info() -> dict[str, Any]:
    return {
        **model_info,
        "artifacts": {
            "model_path": str(MODEL_PATH),
            "scaler_path": str(SCALER_PATH),
            "model_info_path": str(MODEL_INFO_PATH),
        },
        "input_order": FEATURE_ORDER,
        "model_ready": load_error is None and model is not None and scaler is not None,
        "load_error": load_error,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionInput) -> PredictionResponse:
    ensure_model_ready()

    try:
        input_data = build_feature_array(payload)
        input_scaled = scaler.transform(input_data)
        probability = float(model.predict(input_scaled, verbose=0)[0][0])
        prediction = 1 if probability >= 0.5 else 0
        prediction_label, risk_level, message = classify_risk(probability)

        return PredictionResponse(
            prediction=prediction,
            prediction_label=prediction_label,
            probability=round(probability, 4),
            probability_percent=round(probability * 100, 2),
            risk_level=risk_level,
            message=message,
            medical_disclaimer=(
                "Este resultado es orientativo y no reemplaza una evaluacion medica profesional."
            ),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Ocurrio un error durante la prediccion. "
                f"Detalle tecnico: {exc}"
            ),
        ) from exc
