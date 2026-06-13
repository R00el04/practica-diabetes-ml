import argparse
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow import keras
from tensorflow.keras import layers

FEATURE_COLUMNS = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]
TARGET_COLUMN = "Outcome"
SEED = 42


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Entrena un modelo de prediccion de diabetes con Keras + Adam y "
            "genera los artefactos necesarios para la API."
        )
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=120,
        help="Numero maximo de epocas de entrenamiento.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=16,
        help="Tamano del batch para el entrenamiento.",
    )
    parser.add_argument(
        "--no-copy",
        action="store_true",
        help="No copiar automaticamente los artefactos a la carpeta lambda-api.",
    )
    return parser.parse_args()


def validate_dataset(df: pd.DataFrame) -> None:
    expected_columns = FEATURE_COLUMNS + [TARGET_COLUMN]
    missing_columns = [column for column in expected_columns if column not in df.columns]
    unexpected_columns = [column for column in df.columns if column not in expected_columns]

    if missing_columns:
        raise ValueError(
            "El dataset no contiene todas las columnas esperadas. "
            f"Faltan: {missing_columns}"
        )

    if unexpected_columns:
        print(
            "Aviso: el dataset contiene columnas adicionales no utilizadas: "
            f"{unexpected_columns}"
        )


def build_model(input_dim: int) -> keras.Model:
    model = keras.Sequential(
        [
            layers.Input(shape=(input_dim,)),
            layers.Dense(32, activation="relu"),
            layers.Dropout(0.15),
            layers.Dense(16, activation="relu"),
            layers.Dense(1, activation="sigmoid"),
        ]
    )
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    return model


def create_model_info(
    accuracy: float,
    epochs_ran: int,
    dataset_rows: int,
    dataset_path: Path,
) -> dict:
    keras_version = getattr(keras, "__version__", None)
    if keras_version is None:
        keras_version = getattr(tf, "keras", None)
        keras_version = getattr(keras_version, "__version__", "desconocida")

    return {
        "model_name": "diabetes-risk-mlp",
        "description": (
            "Red neuronal densa para clasificacion binaria de riesgo de diabetes "
            "entrenada con Keras y optimizador Adam."
        ),
        "input_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "accuracy": round(float(accuracy), 4),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "tensorflow_version": tf.__version__,
        "keras_version": keras_version,
        "epochs_ran": epochs_ran,
        "dataset_rows": dataset_rows,
        "dataset_file": dataset_path.name,
        "notes": (
            "No se realiza limpieza clinica avanzada de valores cero o atipicos "
            "porque esta practica prioriza el flujo ML + API + Frontend."
        ),
    }


def copy_artifacts(artifacts: list[Path], backend_dir: Path) -> None:
    backend_dir.mkdir(parents=True, exist_ok=True)
    for artifact in artifacts:
        destination = backend_dir / artifact.name
        shutil.copy2(artifact, destination)
        print(f"Artefacto copiado a backend: {destination}")


def main() -> None:
    args = parse_args()
    project_root = Path(__file__).resolve().parent.parent
    ml_dir = Path(__file__).resolve().parent
    backend_dir = project_root / "lambda-api"
    dataset_path = ml_dir / "diabetes.csv"

    if not dataset_path.exists():
        raise FileNotFoundError(f"No se encontro el dataset: {dataset_path}")

    tf.keras.utils.set_random_seed(SEED)
    np.random.seed(SEED)

    df = pd.read_csv(dataset_path)
    validate_dataset(df)

    print("Primeras filas del dataset:")
    print(df.head())
    print("\nColumnas detectadas:")
    print(list(df.columns))
    print(f"\nTotal de registros: {len(df)}")
    print(
        "Nota: no se aplica limpieza clinica avanzada de valores cero o atipicos "
        "porque el objetivo de la practica es validar el flujo end-to-end."
    )

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=SEED,
        stratify=y,
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = build_model(X_train_scaled.shape[1])
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=12,
            restore_best_weights=True,
        )
    ]

    history = model.fit(
        X_train_scaled,
        y_train,
        validation_split=0.2,
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=callbacks,
        verbose=1,
    )

    loss, accuracy = model.evaluate(X_test_scaled, y_test, verbose=0)
    y_pred_prob = model.predict(X_test_scaled, verbose=0).flatten()
    y_pred = (y_pred_prob >= 0.5).astype(int)

    print("\nResumen de entrenamiento:")
    print(f"- Epocas ejecutadas: {len(history.history['loss'])}")
    print(f"- Loss de prueba: {loss:.4f}")
    print(f"- Accuracy de prueba: {accuracy:.4f}")

    confusion = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, digits=4, zero_division=0)
    exact_accuracy = accuracy_score(y_test, y_pred)

    print("\nMatriz de confusion:")
    print(confusion)
    print("\nReporte de clasificacion:")
    print(report)
    print(f"Accuracy verificada con accuracy_score: {exact_accuracy:.4f}")

    model_path = ml_dir / "model.keras"
    scaler_path = ml_dir / "scaler.pkl"
    model_info_path = ml_dir / "model_info.json"

    model.save(model_path)
    joblib.dump(scaler, scaler_path)

    model_info = create_model_info(
        accuracy=exact_accuracy,
        epochs_ran=len(history.history["loss"]),
        dataset_rows=len(df),
        dataset_path=dataset_path,
    )
    model_info_path.write_text(
        json.dumps(model_info, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"\nModelo guardado en: {model_path}")
    print(f"Scaler guardado en: {scaler_path}")
    print(f"Metadata guardada en: {model_info_path}")

    if not args.no_copy:
        copy_artifacts([model_path, scaler_path, model_info_path], backend_dir)

    print("\nProceso completado correctamente.")


if __name__ == "__main__":
    main()
