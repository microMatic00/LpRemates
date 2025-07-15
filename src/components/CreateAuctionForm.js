import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const CreateAuctionForm = ({ onAuctionCreated }) => {
  const { pb, user } = useAuth();
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (image) formData.append("image", image);
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
      setImage(null);
      setCurrentPrice(0);
      setEndTime("");
      if (onAuctionCreated) onAuctionCreated(auction);
    } catch (err) {
      setError(err.message || "Error al crear la subasta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/80 p-6 rounded-xl shadow-lg mb-8 max-w-xl mx-auto"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Crear nueva subasta
      </h3>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagen (opcional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precio inicial
        </label>
        <input
          type="number"
          value={currentPrice}
          onChange={(e) => setCurrentPrice(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded"
          min={0}
          required
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha y hora de finalización
        </label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          La hora se convertirá automáticamente a UTC al guardar la subasta.
        </p>
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded font-medium mt-2 w-full"
        disabled={loading}
      >
        {loading ? "Creando..." : "Crear subasta"}
      </button>
    </form>
  );
};

export default CreateAuctionForm;
