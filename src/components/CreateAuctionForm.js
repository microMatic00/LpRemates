import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const CreateAuctionForm = ({ onAuctionCreated }) => {
  const { pb, user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [endTime, setEndTime] = useState("");
  const [condition, setCondition] = useState("nuevo"); // Estado para la condición del producto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      // Verificar que la imagen esté presente
      if (!image) {
        setError("La imagen es obligatoria");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", image);
      formData.append("condition", condition); // Agregando la condición del producto
      formData.append("current_price", currentPrice);
      // Convertir endTime local a UTC ISO
      let isoEndTime = endTime;
      if (endTime) {
        // endTime es tipo "YYYY-MM-DDTHH:mm" (local)
        const localDate = new Date(endTime);
        isoEndTime = localDate.toISOString(); // UTC ISO
      }
      formData.append("end_time", isoEndTime);
      // Enviar el campo user con el id del usuario logueado
      formData.append("user", user.id);

      const auction = await pb.collection("auctions").create(formData);
      setSuccess("¡Subasta creada exitosamente!");
      setTitle("");
      setDescription("");
      setImage(null);
      setCurrentPrice(0);
      setEndTime("");
      setCondition("nuevo"); // Resetear el estado de la condición
      if (onAuctionCreated) onAuctionCreated(auction);
    } catch (err) {
      setError(err.message || "Error al crear la subasta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-xl max-w-2xl mx-auto">
      {/* Encabezado del formulario */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm inline-block">
          Crear nueva subasta
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
      </div>

      {/* Diseño en dos columnas para formulario con espaciado optimizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {/* Título - columna 1 */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 drop-shadow-sm">
            Título de la subasta
          </label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 pl-10 border border-white/50 bg-white/40 backdrop-blur-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none transition"
              placeholder="Ej: iPhone 13 Pro"
              required
            />
            <div className="absolute left-3 top-3.5 text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Precio inicial - columna 2 */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 drop-shadow-sm">
            Precio inicial ($)
          </label>
          <div className="relative">
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full p-3 pl-10 border border-white/50 bg-white/40 backdrop-blur-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none transition"
              min={0}
              placeholder="Ej: 1000"
              required
            />
            <div className="absolute left-3 top-3.5 text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Condición del producto - nueva columna */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 drop-shadow-sm">
            Estado del artículo
          </label>
          <div className="relative">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full p-3 pl-10 border border-white/50 bg-white/40 backdrop-blur-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none transition appearance-none"
              required
            >
              <option value="nuevo">Nuevo</option>
              <option value="como_nuevo">Como nuevo</option>
              <option value="buen_estado">Buen estado</option>
              <option value="aceptable">Aceptable</option>
              <option value="con_detalles">Con detalles</option>
              <option value="para_reparar">Para reparar</option>
            </select>
            <div className="absolute left-3 top-3.5 text-orange-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Descripción - ocupa las dos columnas */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 drop-shadow-sm">
            Descripción
          </label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 pl-10 border border-white/50 bg-white/40 backdrop-blur-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none transition min-h-[100px]"
              placeholder="Describe detalladamente el artículo que estás subastando..."
            />
            <div className="absolute left-3 top-3.5 text-purple-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Fecha y hora de finalización - columna 1 */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 drop-shadow-sm">
            Fecha y hora de finalización
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 pl-10 border border-white/50 bg-white/40 backdrop-blur-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none transition"
              required
            />
            <div className="absolute left-3 top-3.5 text-amber-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1.5 italic drop-shadow-sm pl-2">
            La hora se convertirá automáticamente a UTC al guardar.
          </p>
        </div>

        {/* Imagen - columna 2 con diseño mejorado */}
        <div className="md:col-span-1">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5 drop-shadow-sm">
            <span className="text-indigo-500 mr-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 5z"
                />
              </svg>
            </span>
            Imagen del artículo <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="mt-1 flex flex-col items-center justify-center">
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center px-4 py-2.5 border border-indigo-300 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 backdrop-blur-sm shadow-sm text-indigo-600 cursor-pointer w-full transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Seleccionar imagen
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="sr-only"
                required
              />
            </label>

            <div
              className={`flex items-center justify-center w-full mt-3 transition-all duration-300 ${
                image ? "opacity-100" : "opacity-60"
              }`}
            >
              {image ? (
                <div className="text-center">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-1">
                    <svg
                      className="-ml-0.5 mr-1.5 h-2 w-2 text-indigo-400"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx={4} cy={4} r={3} />
                    </svg>
                    Imagen seleccionada
                  </div>
                  <p className="text-xs text-gray-600">{image.name}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 10MB
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="bg-red-50/70 backdrop-blur-sm border border-red-200 text-red-600 p-3 rounded-lg text-sm my-5 shadow-sm flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50/70 backdrop-blur-sm border border-green-200 text-green-600 p-3 rounded-lg text-sm my-5 shadow-sm flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Botón de submit */}
      <div className="mt-6">
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3.5 px-6 rounded-lg font-medium w-full shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creando...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Crear subasta
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateAuctionForm;
