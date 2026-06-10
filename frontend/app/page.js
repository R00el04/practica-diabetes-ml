"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const labels = {
    Pregnancies: "Embarazos",
    Glucose: "Glucosa",
    BloodPressure: "Presión arterial",
    SkinThickness: "Grosor de piel",
    Insulin: "Insulina",
    BMI: "Índice de masa corporal",
    DiabetesPedigreeFunction: "Función hereditaria de diabetes",
    Age: "Edad",
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const dataToSend = {
      Pregnancies: Number(formData.Pregnancies),
      Glucose: Number(formData.Glucose),
      BloodPressure: Number(formData.BloodPressure),
      SkinThickness: Number(formData.SkinThickness),
      Insulin: Number(formData.Insulin),
      BMI: Number(formData.BMI),
      DiabetesPedigreeFunction: Number(formData.DiabetesPedigreeFunction),
      Age: Number(formData.Age),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        message: "Error al conectar con la API. Verifica que FastAPI esté ejecutándose.",
      });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Predicción de Riesgo de Diabetes
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Modelo académico desarrollado con Keras, TensorFlow y optimizador Adam.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData).map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {labels[field]}
              </label>
              <input
                type="number"
                step="any"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
              />
            </div>
          ))}

          <button
            type="submit"
            className="md:col-span-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            {loading ? "Procesando..." : "Predecir"}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-5 rounded-lg border bg-gray-50">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              Resultado
            </h2>

            <p className="text-gray-700">
              <strong>Predicción:</strong>{" "}
              {result.prediction === 1 ? "Riesgo alto" : "Riesgo bajo"}
            </p>

            {result.probability !== undefined && (
              <p className="text-gray-700">
                <strong>Probabilidad:</strong> {(result.probability * 100).toFixed(2)}%
              </p>
            )}

            <p className="text-gray-700">
              <strong>Mensaje:</strong> {result.message}
            </p>

            {result.warning && (
              <p className="mt-4 text-sm text-red-600">
                {result.warning}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}