import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

from tensorflow import keras
from tensorflow.keras import layers


# 1. Cargar dataset
df = pd.read_csv("diabetes.csv")

print("Primeras filas del dataset:")
print(df.head())

print("\nColumnas:")
print(df.columns)

# 2. Separar variables independientes y dependiente
X = df.drop("Outcome", axis=1)
y = df["Outcome"]

# 3. Dividir datos en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# 4. Escalar datos
scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 5. Crear modelo con Keras
model = keras.Sequential([
    layers.Input(shape=(X_train_scaled.shape[1],)),
    layers.Dense(16, activation="relu"),
    layers.Dense(8, activation="relu"),
    layers.Dense(1, activation="sigmoid")
])

# 6. Compilar modelo usando Adam
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

# 7. Entrenar modelo
history = model.fit(
    X_train_scaled,
    y_train,
    epochs=100,
    batch_size=16,
    validation_split=0.2,
    verbose=1
)

# 8. Evaluar modelo
loss, accuracy = model.evaluate(X_test_scaled, y_test, verbose=0)

y_pred_prob = model.predict(X_test_scaled)
y_pred = (y_pred_prob > 0.5).astype("int32")

print("\nAccuracy del modelo:", round(accuracy, 4))
print("\nMatriz de confusión:")
print(confusion_matrix(y_test, y_pred))

print("\nReporte de clasificación:")
print(classification_report(y_test, y_pred))

# 9. Guardar modelo y scaler
model.save("model.keras")
joblib.dump(scaler, "scaler.pkl")

print("\nModelo guardado como model.keras")
print("Scaler guardado como scaler.pkl")