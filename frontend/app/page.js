"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const FIELD_CONFIG = [
  {
    name: "pregnancies",
    label: "Embarazos",
    unit: "conteo",
    helper: "Cantidad de embarazos previos de la paciente.",
    meaning:
      "Ayuda a medir antecedentes obstetricos asociados al riesgo de diabetes gestacional o metabolica.",
    placeholder: "Ejemplo: 2",
    exampleValue: "2",
    min: 0,
    max: 20,
    step: "1",
    datasetRange: "0 a 17 en el dataset",
    acceptedRange: "0 a 20 en el formulario",
    scale:
      "0 indica ningun embarazo previo. Valores enteros mayores representan mas antecedentes.",
    healthyReference:
      "No existe un valor 'optimo' universal: este campo describe antecedentes obstetricos, no una medida de laboratorio.",
    abnormalReference:
      "No se clasifica como normal o anormal por si solo. En el contexto del riesgo diabetico, antecedentes de diabetes gestacional o mas embarazos pueden aumentar la relevancia clinica.",
    practicalGuide:
      "Si la paciente nunca ha estado embarazada, coloca 0. Si si hubo gestaciones previas, ingresa el numero total de embarazos.",
    integerOnly: true,
  },
  {
    name: "glucose",
    label: "Glucosa",
    unit: "mg/dL",
    helper: "Concentracion plasmatica de glucosa.",
    meaning:
      "Es una de las variables mas influyentes del modelo porque representa el nivel de azucar en sangre.",
    placeholder: "Ejemplo: 120",
    exampleValue: "120",
    min: 0,
    max: 300,
    step: "0.1",
    datasetRange: "0 a 199 en el dataset",
    acceptedRange: "0 a 300 en el formulario",
    scale:
      "Valores mas altos suelen asociarse a mayor riesgo. El modelo interpreta la variable ya escalada internamente.",
    healthyReference:
      "Referencia orientativa en ayunas: normal menor de 100 mg/dL; prediabetes 100 a 125 mg/dL; diabetes 126 mg/dL o mas.",
    abnormalReference:
      "En general, glucosa en ayunas muy elevada sugiere mayor riesgo metabolico. En esta practica, valores por encima de 126 mg/dL son claramente anormales como referencia orientativa.",
    practicalGuide:
      "Si tienes un valor de laboratorio en ayunas, ese es el mas util para esta variable. Si no, usa un valor de ejemplo academico como 90, 110 o 140 para probar escenarios.",
  },
  {
    name: "bloodPressure",
    label: "Presion arterial",
    unit: "mm Hg",
    helper: "Presion arterial diastolica.",
    meaning:
      "Representa la presion minima entre latidos, un indicador cardiovascular relevante en el analisis.",
    placeholder: "Ejemplo: 70",
    exampleValue: "70",
    min: 0,
    max: 200,
    step: "0.1",
    datasetRange: "0 a 122 en el dataset",
    acceptedRange: "0 a 200 en el formulario",
    scale:
      "Valores mayores pueden sugerir mas carga metabolica o cardiovascular, aunque no son diagnostico por si solos.",
    healthyReference:
      "Referencia orientativa para la presion diastolica: normal si es menor de 80 mm Hg; elevada si entra en el rango de hipertension desde 80 mm Hg o mas, segun la clasificacion general de presion arterial.",
    abnormalReference:
      "Una diastolica de 80 a 89 mm Hg entra en hipertension etapa 1; 90 mm Hg o mas ya es mas anormal. Menos de 60 mm Hg puede ser baja en algunos contextos.",
    practicalGuide:
      "Ingresa la presion diastolica, no la sistolica. Si la medicion fue 120/78, aqui corresponde 78.",
  },
  {
    name: "skinThickness",
    label: "Grosor cutaneo",
    unit: "mm",
    helper: "Pliegue cutaneo del triceps.",
    meaning:
      "Se usa como aproximacion indirecta a la grasa corporal subcutanea.",
    placeholder: "Ejemplo: 20",
    exampleValue: "20",
    min: 0,
    max: 100,
    step: "0.1",
    datasetRange: "0 a 99 en el dataset",
    acceptedRange: "0 a 100 en el formulario",
    scale:
      "Valores cercanos a cero existen en el dataset, pero en un entorno clinico real requeririan revision.",
    healthyReference:
      "No hay un valor unico universal de 'normalidad' porque depende del sexo, la edad, el sitio anatomico y la composicion corporal.",
    abnormalReference:
      "Valores 0 o extremadamente altos suelen requerir verificacion clinica o de captura. En esta practica se usan como dato tecnico del dataset, no como diagnostico aislado.",
    practicalGuide:
      "Si no cuentas con una medicion real del pliegue tricipital, usa un valor academico moderado como 20 para pruebas controladas.",
  },
  {
    name: "insulin",
    label: "Insulina",
    unit: "mu U/mL",
    helper: "Insulina serica de 2 horas.",
    meaning:
      "Mide la respuesta insulinica y ayuda a identificar desbalances metabolicos.",
    placeholder: "Ejemplo: 79",
    exampleValue: "79",
    min: 0,
    max: 900,
    step: "0.1",
    datasetRange: "0 a 846 en el dataset",
    acceptedRange: "0 a 900 en el formulario",
    scale:
      "Valores mas elevados pueden indicar resistencia a la insulina, aunque el contexto clinico importa.",
    healthyReference:
      "No hay un unico rango universal en esta practica porque la insulina depende del metodo del laboratorio y de si la muestra fue en ayunas. Debe interpretarse junto con la glucosa y el rango de referencia del laboratorio.",
    abnormalReference:
      "Insulina persistentemente alta puede sugerir resistencia a la insulina; insulina demasiado baja con glucosa alta puede sugerir deficiencia de secrecion. Pero este campo no debe interpretarse solo.",
    practicalGuide:
      "Si tienes un valor de laboratorio, usa ese mismo. Si no, puedes usar 79 como ejemplo academico del dataset o probar escenarios mas bajos y mas altos.",
  },
  {
    name: "bmi",
    label: "Indice de masa corporal",
    unit: "kg/m²",
    helper: "Relacion entre peso y talla.",
    meaning:
      "Se usa para aproximar el estado corporal y suele correlacionarse con riesgo metabolico.",
    placeholder: "Ejemplo: 25.5",
    exampleValue: "25.5",
    min: 0,
    max: 70,
    step: "0.1",
    datasetRange: "0.0 a 67.1 en el dataset",
    acceptedRange: "0 a 70 en el formulario",
    scale:
      "Valores mayores suelen reflejar mayor carga metabolica. El sistema solo los usa como dato academico.",
    healthyReference:
      "Referencia orientativa en adultos: peso saludable entre 18.5 y menor de 25; sobrepeso entre 25 y menor de 30; obesidad desde 30.",
    abnormalReference:
      "Menor de 18.5 se considera bajo peso. Desde 25 empieza sobrepeso y desde 30 ya se considera obesidad, con mayor riesgo metabolico.",
    practicalGuide:
      "Si no tienes el IMC calculado, puedes usar valores academicos como 22, 27 o 34 para representar escenarios sano, intermedio y alto.",
  },
  {
    name: "diabetesPedigreeFunction",
    label: "Funcion de predisposicion diabetica",
    unit: "indice",
    helper: "Indicador hereditario de riesgo.",
    meaning:
      "Resume antecedentes familiares y susceptibilidad hereditaria a diabetes.",
    placeholder: "Ejemplo: 0.5",
    exampleValue: "0.5",
    min: 0,
    max: 3,
    step: "0.001",
    datasetRange: "0.078 a 2.42 en el dataset",
    acceptedRange: "0 a 3 en el formulario",
    scale:
      "Valores mas altos implican mayor peso del antecedente familiar dentro del modelo.",
    healthyReference:
      "No existe un rango clinico universal de 'normalidad'. Es un indice del dataset que resume carga hereditaria y antecedentes familiares.",
    abnormalReference:
      "Valores mayores no son una enfermedad por si mismos, pero si suelen representar mayor predisposicion familiar dentro del modelo.",
    practicalGuide:
      "Si no conoces el indice exacto, usa valores de prueba como 0.2, 0.5 o 1.0 para ver como cambia el riesgo estimado.",
  },
  {
    name: "age",
    label: "Edad",
    unit: "anios",
    helper: "Edad de la persona evaluada.",
    meaning:
      "La edad influye en el perfil de riesgo y en la interpretacion general del caso.",
    placeholder: "Ejemplo: 33",
    exampleValue: "33",
    min: 18,
    max: 120,
    step: "1",
    datasetRange: "21 a 81 en el dataset",
    acceptedRange: "18 a 120 en el formulario",
    scale:
      "Se esperan valores enteros. El formulario acepta un rango amplio para pruebas y demostracion.",
    healthyReference:
      "La edad no se clasifica como normal o anormal. En riesgo de diabetes, el riesgo empieza a aumentar alrededor de los 45 anios y aumenta mas despues de los 65.",
    abnormalReference:
      "No hay una edad 'anormal', pero edades mayores se asocian a mayor probabilidad de diabetes tipo 2 como factor de riesgo.",
    practicalGuide:
      "Ingresa la edad real de la persona. Para pruebas, compara escenarios menores de 40, entre 45 y 59, y 60 o mas.",
    integerOnly: true,
  },
];

const INITIAL_FORM = FIELD_CONFIG.reduce((accumulator, field) => {
  accumulator[field.name] = "";
  return accumulator;
}, {});

const RISK_STYLES = {
  bajo: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
  },
  medio: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
  },
  alto: {
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    bar: "bg-rose-500",
  },
};

function validateField(field, rawValue) {
  if (rawValue === "") {
    return "Este campo es obligatorio.";
  }

  const parsedValue = Number(rawValue);
  if (Number.isNaN(parsedValue)) {
    return "Ingresa un numero valido.";
  }

  if (field.integerOnly && !Number.isInteger(parsedValue)) {
    return "Este campo solo acepta numeros enteros.";
  }

  if (parsedValue < field.min || parsedValue > field.max) {
    return `Ingresa un valor dentro del rango permitido: ${field.acceptedRange}.`;
  }

  return "";
}

function buildPayload(formData) {
  return FIELD_CONFIG.reduce((accumulator, field) => {
    accumulator[field.name] = Number(formData[field.name]);
    return accumulator;
  }, {});
}

export default function Home() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const riskStyles = result?.risk_level
    ? RISK_STYLES[result.risk_level] || RISK_STYLES.bajo
    : RISK_STYLES.bajo;

  const handleChange = (event) => {
    const { name, value } = event.target;
    const field = FIELD_CONFIG.find((item) => item.name === name);

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (field) {
      setFieldErrors((current) => ({
        ...current,
        [name]: validateField(field, value),
      }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const field = FIELD_CONFIG.find((item) => item.name === name);

    if (!field) {
      return;
    }

    setFieldErrors((current) => ({
      ...current,
      [name]: validateField(field, value),
    }));
  };

  const handleFillExample = () => {
    const exampleData = FIELD_CONFIG.reduce((accumulator, field) => {
      accumulator[field.name] = field.exampleValue;
      return accumulator;
    }, {});

    setFormData(exampleData);
    setFieldErrors({});
    setError("");
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const nextFieldErrors = FIELD_CONFIG.reduce((accumulator, field) => {
      accumulator[field.name] = validateField(field, formData[field.name]);
      return accumulator;
    }, {});

    setFieldErrors(nextFieldErrors);

    const firstError = Object.values(nextFieldErrors).find(Boolean);
    if (firstError) {
      setError("Revisa los campos marcados antes de enviar el formulario.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload(formData)),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "No se pudo procesar la prediccion.");
      }

      setResult(data);
    } catch (submissionError) {
      setError(
        submissionError.message ||
          "Error al conectar con la API. Verifica que el backend este activo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(24,55,91,0.12),_transparent_38%),linear-gradient(180deg,_#f6fbff_0%,_#eef4f8_44%,_#f9fafb_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700 sm:text-xs">
              Practica academica de machine learning
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Prediccion orientativa de riesgo de diabetes con Keras, FastAPI y Next.js
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
              Esta interfaz recoge las 8 variables medicas del dataset, valida
              rangos utiles para la practica y muestra una interpretacion orientativa
              basada en el modelo academico entrenado.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Modelo</p>
                <p className="mt-2 text-sm text-slate-600">
                  Red neuronal binaria con TensorFlow/Keras y optimizador Adam.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Validacion</p>
                <p className="mt-2 text-sm text-slate-600">
                  Cada campo tiene rango permitido, ejemplo rapido y explicacion en
                  espanol.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Aviso</p>
                <p className="mt-2 text-sm text-slate-600">
                  El resultado es academico y no reemplaza una evaluacion medica
                  profesional.
                </p>
              </article>
            </div>
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
              Guia rapida de uso
            </p>
            <ol className="mt-4 space-y-4 text-sm leading-7 text-slate-200">
              <li>1. Usa los rangos sugeridos para evitar errores de captura.</li>
              <li>2. Si deseas probar el sistema rapido, usa el boton Cargar ejemplo.</li>
              <li>3. El backend convierte internamente cada valor al orden del dataset.</li>
            </ol>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">API configurada</p>
              <p className="mt-2 break-all font-mono text-xs text-sky-200">{API_URL}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-5">
              <p className="text-sm font-semibold text-sky-100">
                Rango oficial del formulario
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Los limites aceptados por la interfaz son amplios para la demostracion,
                pero cada tarjeta inferior tambien muestra el rango observado en el dataset.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold text-slate-950">
                  Formulario de variables medicas
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Completa las 8 variables del dataset. Esta practica no incluye
                  limpieza clinica avanzada de valores cero o atipicos; el objetivo
                  principal es validar el flujo completo ML + API + Frontend.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFillExample}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                Cargar ejemplo
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2"
              noValidate
            >
              {FIELD_CONFIG.map((field) => {
                const hasError = Boolean(fieldErrors[field.name]);

                return (
                  <div key={field.name} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-semibold text-slate-800"
                      >
                        {field.label}
                      </label>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {field.unit}
                      </span>
                    </div>

                    <input
                      id={field.name}
                      type="number"
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      inputMode="decimal"
                      placeholder={field.placeholder}
                      aria-invalid={hasError}
                      aria-describedby={`${field.name}-helper ${field.name}-range ${field.name}-error`}
                      className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                        hasError
                          ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-100"
                          : "border-slate-200 bg-slate-50 focus:border-sky-400 focus:ring-sky-100"
                      }`}
                    />

                    <p
                      id={`${field.name}-helper`}
                      className="text-xs leading-5 text-slate-500"
                    >
                      {field.helper}
                    </p>
                    <p
                      id={`${field.name}-range`}
                      className="text-xs leading-5 text-slate-500"
                    >
                      Rango permitido: {field.acceptedRange}. Rango del dataset:{" "}
                      {field.datasetRange}.
                    </p>

                    {hasError ? (
                      <p
                        id={`${field.name}-error`}
                        className="text-xs font-medium leading-5 text-rose-600"
                      >
                        {fieldErrors[field.name]}
                      </p>
                    ) : null}
                  </div>
                );
              })}

              <div className="md:col-span-2 flex flex-col gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? "Consultando modelo..." : "Calcular riesgo"}
                </button>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.2)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Resultado del modelo
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Interpretacion orientativa
                </h2>
              </div>
              {result?.risk_level ? (
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${riskStyles.badge}`}
                >
                  {result.risk_level}
                </span>
              ) : null}
            </div>

            {result ? (
              <div className="mt-8 space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-300">Prediccion</p>
                  <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                    {result.prediction_label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {result.message}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-300">Probabilidad estimada</p>
                      <p className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                        {result.probability_percent}%
                      </p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Valor bruto del modelo: {result.probability}
                    </p>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${riskStyles.bar}`}
                      style={{
                        width: `${Math.max(4, Math.min(result.probability_percent, 100))}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Prediccion binaria
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {result.prediction}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Nivel de riesgo
                      </p>
                      <p className="mt-2 text-lg font-semibold capitalize text-white">
                        {result.risk_level}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Interpretacion
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {result.prediction_label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
                  <p className="text-sm leading-6 text-amber-50">
                    {result.medical_disclaimer}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-7 text-slate-300 sm:p-8">
                Envia el formulario para visualizar la prediccion, la probabilidad,
                el nivel de riesgo y el mensaje interpretativo generado por la API.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
              Guia informativa de variables
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Que valor colocar, que significa y que escala usa cada campo
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Esta guia resume el significado funcional de cada variable dentro de
              la practica. Donde existen referencias clinicas generales, se muestran
              como orientacion. Donde no existe un corte universal, se indica de
              forma explicita para no sobreinterpretar el dato.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {FIELD_CONFIG.map((field) => (
              <article
                key={`${field.name}-guide`}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {field.label}
                    </h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700">
                      {field.unit}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
                    Ejemplo {field.exampleValue}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Que significa:</span>{" "}
                    {field.meaning}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Escala:</span>{" "}
                    {field.scale}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Valor optimo o referencia sana:</span>{" "}
                    {field.healthyReference}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Valores anormales o de alerta:</span>{" "}
                    {field.abnormalReference}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Rango del dataset:</span>{" "}
                    {field.datasetRange}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Rango aceptado:</span>{" "}
                    {field.acceptedRange}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Como llenarlo:</span>{" "}
                    {field.practicalGuide}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-slate-700">
            <p className="font-semibold text-slate-900">Base de la guia orientativa</p>
            <p className="mt-2">
              Las referencias generales de glucosa, presion arterial, BMI y riesgo por edad
              se apoyan en fuentes medicas publicas como ADA, CDC, NHLBI y MedlinePlus.
              Algunas variables del dataset, como pliegue cutaneo, funcion de predisposicion
              diabetica y numero de embarazos, no tienen un unico umbral clinico universal,
              por eso aqui se explican como factores del modelo y no como diagnosticos aislados.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
