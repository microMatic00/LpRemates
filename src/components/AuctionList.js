import React, { useState, useEffect } from "react";
import PocketBase from "pocketbase";

// Instancia de PocketBase conectada a la instancia local
const POCKETBASE_URL = "http://127.0.0.1:8090";
console.log("Intentando conectar a PocketBase en:", POCKETBASE_URL);
const pb = new PocketBase(POCKETBASE_URL);

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidForms, setBidForms] = useState({});
  const [bidAmount, setBidAmount] = useState({});
  const [bidError, setBidError] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!pb.authStore.isValid
  );

  // Función para formatear la fecha a una cuenta regresiva legible
  const formatTimeLeft = (endTimeString) => {
    const endTime = new Date(endTimeString).getTime();
    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) {
      return "Subasta finalizada";
    }

    // Calculamos días, horas, minutos y segundos
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    result += `${seconds}s`;

    return result;
  };

  // Función para comprobar si PocketBase está funcionando
  const checkPocketBaseConnection = async () => {
    try {
      console.log("Comprobando conexión a PocketBase...");

      // Primero intentamos acceder directamente a la colección auctions
      try {
        console.log("Intentando acceder a la colección auctions...");
        const testFetch = await fetch(
          `${POCKETBASE_URL}/api/collections/auctions/records?page=1&perPage=1`
        );
        const testResult = await testFetch.json();
        console.log("Respuesta directa de API auctions:", testResult);

        // Si llegamos aquí, la colección existe y podemos acceder a ella
        return true;
      } catch (fetchErr) {
        console.error("Error al intentar acceso directo a la API:", fetchErr);
      }

      // Si el acceso directo falla, probamos con el health check
      console.log("Intentando health check...");
      const health = await pb.health.check();
      console.log("PocketBase está funcionando (health check):", health);
      return true;
    } catch (err) {
      console.error("Error al conectar con PocketBase:", err);
      setError(
        `No se pudo conectar a PocketBase en ${POCKETBASE_URL}. Asegúrate de que el servidor esté en ejecución.`
      );
      setLoading(false);
      return false;
    }
  };

  // Función para obtener todas las subastas activas
  const fetchAuctions = async () => {
    try {
      setLoading(true);

      // Verificamos que PocketBase esté funcionando
      const isConnected = await checkPocketBaseConnection();
      if (!isConnected) {
        return; // El mensaje de error ya se estableció en checkPocketBaseConnection
      }

      const now = new Date().toISOString();
      console.log("Fecha actual para filtrado:", now);

      try {
        console.log("Obteniendo subastas activas...");

        // Intento alternativo con fetch directo
        try {
          console.log("Intentando fetch directo...");
          const response = await fetch(
            `${POCKETBASE_URL}/api/collections/auctions/records?filter=(end_time>'${now}')&sort=end_time&expand=user`
          );
          const data = await response.json();
          console.log("Datos de fetch directo:", data);

          if (data && data.items) {
            console.log("Fetch directo exitoso, procesando datos...");
            setAuctions(data.items);
            setLoading(false);

            // Inicializamos los estados para los formularios de puja de cada subasta
            const initialBidForms = {};
            const initialBidAmounts = {};
            data.items.forEach((auction) => {
              initialBidForms[auction.id] = false;
              initialBidAmounts[auction.id] = auction.current_price + 100;
            });
            setBidForms(initialBidForms);
            setBidAmount(initialBidAmounts);
            return;
          }
        } catch (fetchError) {
          console.error("Error en fetch directo:", fetchError);
        }

        // Si el fetch directo falla, usamos el SDK
        console.log("Intentando con SDK de PocketBase...");
        const records = await pb.collection("auctions").getList(1, 50, {
          filter: `end_time > "${now}"`,
          expand: "user",
          sort: "end_time",
        });

        console.log("Subastas obtenidas con SDK:", records.items);
        setAuctions(records.items);
        setLoading(false);

        // Inicializamos los estados para los formularios de puja de cada subasta
        const initialBidForms = {};
        const initialBidAmounts = {};
        records.items.forEach((auction) => {
          initialBidForms[auction.id] = false;
          initialBidAmounts[auction.id] = auction.current_price + 100; // Un valor predeterminado mayor al precio actual
        });
        setBidForms(initialBidForms);
        setBidAmount(initialBidAmounts);
      } catch (err) {
        console.error("Error al obtener subastas:", err);

        // Hacemos una verificación más básica para ver si podemos acceder a cualquier registro
        try {
          console.log("Intentando acceder a todos los registros sin filtro...");
          const allRecords = await fetch(
            `${POCKETBASE_URL}/api/collections/auctions/records`
          );
          const allData = await allRecords.json();
          console.log("Todos los registros disponibles:", allData);

          if (allData && allData.items && allData.items.length > 0) {
            setError(
              `Se encontraron ${allData.items.length} registros en la colección, pero ninguno tiene fecha de finalización futura. Verifica los datos de tus subastas.`
            );
          } else {
            setError(
              "La conexión a PocketBase funciona, pero no hay registros en la colección 'auctions'. Crea algunas subastas de prueba."
            );
          }
        } catch (basicFetchErr) {
          console.error("Error en fetch básico:", basicFetchErr);

          if (err.status === 404) {
            setError(
              "La colección 'auctions' no existe en PocketBase o no tienes permisos para acceder a ella. Por favor, asegúrate de que la colección existe y que las reglas de API para List/Search están vacías."
            );
          } else if (err.status === 401) {
            setError(
              "No tienes permisos para acceder a la colección 'auctions'. Asegúrate de que las reglas de API para List/Search están vacías."
            );
          } else {
            setError(
              `Error al cargar subastas: ${err.message || "Desconocido"}`
            );
          }
        }

        setLoading(false);
      }
    } catch (err) {
      console.error("Error general al obtener subastas:", err);
      setError(
        "No se pudieron cargar las subastas. Por favor, inténtalo de nuevo."
      );
      setLoading(false);
    }
  };

  // Efecto para obtener las subastas al cargar el componente
  useEffect(() => {
    let isMounted = true;

    const loadAuctions = async () => {
      try {
        if (isMounted) {
          await fetchAuctions();
        }
      } catch (err) {
        console.error("Error en el efecto de carga de subastas:", err);
      }
    };

    loadAuctions();

    // Configuramos un intervalo para actualizar el tiempo restante cada segundo
    const timeInterval = setInterval(() => {
      if (isMounted) {
        setAuctions((prevAuctions) => [...prevAuctions]);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timeInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Efecto para escuchar cambios en la autenticación
  useEffect(() => {
    // Verificamos el estado de autenticación inicial
    setIsAuthenticated(pb.authStore.isValid);

    // Escuchamos cambios en la autenticación
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    });

    return unsubscribe;
  }, []);

  // Efecto para suscribirse a las pujas en tiempo real
  useEffect(() => {
    // Para cada subasta, nos suscribimos a las nuevas pujas
    const subscriptions = [];

    if (auctions.length === 0) {
      return; // No intentamos suscribirnos si no hay subastas
    }

    try {
      auctions.forEach((auction) => {
        const subscription = pb.collection("bids").subscribe("*", function (e) {
          // Si la puja está relacionada con nuestra subasta, actualizamos la información
          if (e.record.auction === auction.id) {
            setAuctions((prevAuctions) => {
              return prevAuctions.map((prevAuction) => {
                if (prevAuction.id === auction.id) {
                  return { ...prevAuction, current_price: e.record.amount };
                }
                return prevAuction;
              });
            });
          }
        });

        subscriptions.push(subscription);
      });
    } catch (err) {
      console.error("Error al suscribirse a las pujas:", err);
      // No mostramos el error al usuario para no interrumpir su experiencia
    }

    // Limpiamos las suscripciones al desmontar el componente
    return () => {
      subscriptions.forEach((subscription) => {
        try {
          pb.collection("bids").unsubscribe(subscription);
        } catch (error) {
          console.error("Error al desuscribirse:", error);
        }
      });
    };
  }, [auctions]);

  // Función para mostrar/ocultar el formulario de puja
  const toggleBidForm = (auctionId) => {
    if (!isAuthenticated) {
      setBidError({
        ...bidError,
        [auctionId]: "Debes iniciar sesión para pujar",
      });
      return;
    }

    setBidForms({
      ...bidForms,
      [auctionId]: !bidForms[auctionId],
    });

    // Limpiamos errores previos
    setBidError({
      ...bidError,
      [auctionId]: null,
    });
  };

  // Función para manejar el cambio en el input de la puja
  const handleBidChange = (auctionId, value) => {
    setBidAmount({
      ...bidAmount,
      [auctionId]: value,
    });
  };

  // Función para enviar una puja
  const handleSubmitBid = async (auction) => {
    try {
      if (!isAuthenticated) {
        setBidError({
          ...bidError,
          [auction.id]: "Debes iniciar sesión para pujar",
        });
        return;
      }

      const amount = parseFloat(bidAmount[auction.id]);

      // Validamos que la puja sea mayor al precio actual
      if (amount <= auction.current_price) {
        setBidError({
          ...bidError,
          [auction.id]: `Tu puja debe ser mayor a ${auction.current_price}`,
        });
        return;
      }

      try {
        // Creamos la nueva puja
        await pb.collection("bids").create({
          auction: auction.id,
          user: pb.authStore.model?.id,
          amount: amount,
          created: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error al crear la puja:", err);
        if (err.status === 404) {
          setBidError({
            ...bidError,
            [auction.id]:
              "La colección 'bids' no existe. Por favor, configura tu base de datos según las instrucciones.",
          });
        } else if (err.status === 401 || err.data?.user?.code === "required") {
          setBidError({
            ...bidError,
            [auction.id]: "Debes iniciar sesión para pujar.",
          });
        } else {
          setBidError({
            ...bidError,
            [auction.id]: `Error al crear la puja: ${
              err.message || "Desconocido"
            }`,
          });
        }
        return;
      }

      try {
        // Actualizamos el precio actual de la subasta
        await pb.collection("auctions").update(auction.id, {
          current_price: amount,
        });
      } catch (err) {
        console.error("Error al actualizar el precio de la subasta:", err);
        // Aunque hubo error al actualizar el precio, la puja se creó correctamente,
        // por lo que mostramos una advertencia pero no un error crítico
        console.warn(
          "La puja se registró pero el precio no se actualizó automáticamente."
        );
      }

      // Actualizamos la lista de subastas localmente
      setAuctions((prevAuctions) => {
        return prevAuctions.map((prevAuction) => {
          if (prevAuction.id === auction.id) {
            return { ...prevAuction, current_price: amount };
          }
          return prevAuction;
        });
      });

      // Ocultamos el formulario de puja
      setBidForms({
        ...bidForms,
        [auction.id]: false,
      });

      // Limpiamos los errores
      setBidError({
        ...bidError,
        [auction.id]: null,
      });
    } catch (err) {
      console.error("Error general al enviar la puja:", err);
      setBidError({
        ...bidError,
        [auction.id]: "Error al enviar la puja. Por favor, inténtalo de nuevo.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>

        <div className="mt-4">
          <h3 className="font-bold text-red-800">
            Solución a problemas comunes:
          </h3>
          <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
            <li>
              Asegúrate de que PocketBase esté funcionando en{" "}
              <code className="bg-red-50 px-1">http://127.0.0.1:8090</code>
            </li>
            <li>
              Verifica que has creado la colección{" "}
              <code className="bg-red-50 px-1">auctions</code> en PocketBase
            </li>
            <li>
              <strong>¡Importante!</strong> Las reglas de API para{" "}
              <strong>List/Search</strong> y <strong>View</strong> deben estar
              VACÍAS
            </li>
            <li>
              Si acabas de cambiar las reglas de API, refresca la página o
              reinicia PocketBase
            </li>
            <li>
              Verifica que tus subastas tienen una fecha de finalización (
              <code>end_time</code>) en el futuro
            </li>
            <li>
              Revisa el archivo{" "}
              <code className="bg-red-50 px-1">pocketbase-setup.js</code> para
              más detalles
            </li>
          </ol>

          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded">
            <p className="text-sm font-medium">
              Prueba de conexión a PocketBase:
            </p>
            <button
              onClick={() =>
                window.open(
                  "http://127.0.0.1:8090/api/collections/auctions/records",
                  "_blank"
                )
              }
              className="mt-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-xs"
            >
              Probar conexión a PocketBase
            </button>
            <p className="text-xs mt-2">
              Si la conexión funciona correctamente, deberías ver datos JSON. Si
              ves datos pero la aplicación sigue sin funcionar, puede ser un
              problema con el formato de fecha o con CORS.
            </p>
          </div>

          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            <p className="text-sm font-medium">CORS y problemas de acceso:</p>
            <p className="text-xs">
              Si estás ejecutando la aplicación React en un puerto diferente
              (ej: localhost:3000) y PocketBase en otro (127.0.0.1:8090), puede
              haber problemas de CORS. Intenta ejecutar ambos en el mismo origen
              o configura CORS en PocketBase.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 text-lg">
          No hay subastas activas en este momento.
        </p>
        <p className="text-gray-500 mt-2">
          Puedes crear nuevas subastas desde el panel de administración de
          PocketBase.
        </p>
        <a
          href="http://127.0.0.1:8090/_/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ir al panel de PocketBase
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map((auction) => (
        <div
          key={auction.id}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Imagen de la subasta */}
          <div className="h-48 w-full bg-gray-300 overflow-hidden">
            {auction.image ? (
              <img
                src={`http://127.0.0.1:8090/api/files/auctions/${auction.id}/${auction.image}`}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Información de la subasta */}
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {auction.title}
            </h2>

            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">
                Creado por:{" "}
                {auction.expand?.user?.name || "Usuario desconocido"}
              </span>
            </div>

            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="block text-sm text-gray-500">
                  Precio actual:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ${auction.current_price.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">
                  Tiempo restante:
                </span>
                <span className="font-mono text-amber-600 font-semibold">
                  {formatTimeLeft(auction.end_time)}
                </span>
              </div>
            </div>

            {/* Botón para pujar */}
            <button
              onClick={() => toggleBidForm(auction.id)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              {bidForms[auction.id] ? "Cancelar" : "Pujar"}
            </button>

            {/* Formulario de puja */}
            {bidForms[auction.id] && (
              <div className="mt-3 border-t pt-3">
                <div className="mb-2">
                  <label
                    htmlFor={`bid-${auction.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tu oferta (${auction.current_price.toLocaleString()} o más):
                  </label>
                  <input
                    type="number"
                    id={`bid-${auction.id}`}
                    value={bidAmount[auction.id]}
                    onChange={(e) =>
                      handleBidChange(auction.id, parseFloat(e.target.value))
                    }
                    min={auction.current_price + 1}
                    step="100"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleSubmitBid(auction)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
                >
                  Confirmar puja
                </button>
                {bidError[auction.id] && (
                  <p className="text-red-500 text-sm mt-1">
                    {bidError[auction.id]}
                  </p>
                )}
              </div>
            )}

            {/* Mensaje de error si no está autenticado y trató de pujar */}
            {!bidForms[auction.id] && bidError[auction.id] && (
              <p className="text-red-500 text-sm mt-1">
                {bidError[auction.id]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuctionList;
