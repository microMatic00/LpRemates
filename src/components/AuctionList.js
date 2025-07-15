import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const AuctionList = () => {
  const { isAuthenticated, pb } = useAuth();
  const POCKETBASE_URL = "http://127.0.0.1:8090";

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidForms, setBidForms] = useState({});
  const [bidAmount, setBidAmount] = useState({});
  const [bidError, setBidError] = useState({});

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
            `${POCKETBASE_URL}/api/collections/auctions/records?sort=end_time&expand=user`
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

  // No necesitamos manejar el estado de autenticación aquí
  // ya que lo obtenemos del contexto de autenticación

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
  }, [auctions, pb]);

  // Función para mostrar/ocultar el formulario de puja
  const toggleBidForm = (auctionId) => {
    if (!isAuthenticated) {
      setBidError({
        ...bidError,
        [auctionId]: "Debes iniciar sesión para pujar",
      });
      return;
    }

    // Buscar la subasta correspondiente
    const auction = auctions.find((a) => a.id === auctionId);

    // Verificar si es una subasta propia
    if (auction && auction.user === pb.authStore.model?.id) {
      setBidError({
        ...bidError,
        [auctionId]: "No puedes pujar en tu propia subasta",
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

      // Validamos que la puja sea mayor al precio current
      if (amount <= auction.current_price) {
        setBidError({
          ...bidError,
          [auction.id]: `Tu puja debe ser mayor a ${auction.current_price}`,
        });
        return;
      }

      // Verificamos si la subasta pertenece al usuario actual
      if (auction.user === pb.authStore.model?.id) {
        setBidError({
          ...bidError,
          [auction.id]: `No puedes pujar en tu propia subasta`,
        });
        return;
      }

      try {
        // Creamos la nueva puja
        const newBid = await pb.collection("bids").create({
          auction: auction.id,
          user: pb.authStore.model?.id,
          amount: amount,
          created: new Date().toISOString(),
        });

        console.log("✅ Puja creada exitosamente:", newBid);
        console.log("🔍 ID de subasta utilizado:", auction.id);
        console.log("🔍 Tipo de ID de subasta:", typeof auction.id);
      } catch (err) {
        console.error("Error al crear la puja:", err);
        console.log("🔍 Datos de la petición:", {
          auction: auction.id,
          user: pb.authStore.model?.id,
          amount: amount,
        });

        // Si el backend rechaza la puja por subasta finalizada
        if (
          err.data?.auction?.code === "validation_failed" ||
          (err.data?.auction?.message &&
            err.data?.auction?.message.includes("end_time"))
        ) {
          setBidError({
            ...bidError,
            [auction.id]: "No puedes pujar en una subasta finalizada.",
          });
        } else if (err.status === 404) {
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
        console.log(
          "🔄 Intentando actualizar precio de subasta con ID:",
          auction.id
        );

        // Verificamos que la subasta exista antes de actualizarla
        try {
          const auctionCheck = await pb
            .collection("auctions")
            .getOne(auction.id);
          console.log("✅ Subasta encontrada:", auctionCheck.id);
        } catch (checkErr) {
          console.error("❌ Error al verificar la subasta:", checkErr);
        }

        await pb.collection("auctions").update(auction.id, {
          current_price: amount,
        });

        console.log("✅ Precio de subasta actualizado correctamente");
      } catch (err) {
        console.error("❌ Error al actualizar el precio de la subasta:", err);
        console.log("🔍 Código de estado:", err.status);
        console.log("🔍 Mensaje de error:", err.message);
        console.log("🔍 Datos del error:", err.data);

        // Mensaje de error más específico basado en el tipo de error
        let errorMessage =
          "La puja se registró pero el precio no se actualizó automáticamente.";

        if (err.status === 404) {
          errorMessage += " No se encontró la subasta con ID: " + auction.id;
        } else if (err.status === 403) {
          errorMessage += " No tienes permisos para actualizar la subasta.";
        } else if (err.status === 400) {
          errorMessage += " Datos de actualización inválidos.";
        }

        // Aunque hubo error al actualizar el precio, la puja se creó correctamente,
        // por lo que mostramos una advertencia pero no un error crítico
        console.warn(errorMessage);

        // Notificamos al usuario con una alerta menos intrusiva
        const alertDiv = document.createElement("div");
        alertDiv.className =
          "fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50";
        alertDiv.innerHTML = `
          <div class="flex">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
            <div>
              <p class="font-bold">Atención</p>
              <p class="text-sm">${errorMessage}</p>
            </div>
          </div>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => {
          alertDiv.style.opacity = "0";
          alertDiv.style.transition = "opacity 0.5s";
          setTimeout(() => document.body.removeChild(alertDiv), 500);
        }, 5000);
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {auctions.map((auction) => {
        // Verificamos si la subasta pertenece al usuario actual
        const isOwnAuction = auction.user === pb.authStore.model?.id;
        // Determinar si la subasta está finalizada
        const endTimeMs = new Date(auction.end_time).getTime();
        const nowMs = Date.now();
        const isReallyFinished = endTimeMs <= nowMs;
        // Determinar si la subasta está por finalizar (menos de 1 hora)
        const timeLeftMs = endTimeMs - nowMs;
        const isEndingSoon = !isReallyFinished && timeLeftMs <= 60 * 60 * 1000;

        return (
          <div
            key={auction.id}
            className={`rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02]
              ${
                isReallyFinished
                  ? "border border-gray-300 opacity-80 grayscale shadow-lg"
                  : isEndingSoon
                  ? "border-4 border-amber-500 shadow-xl"
                  : "border border-white/30 shadow-lg"
              }
              ${isOwnAuction ? "ring-2 ring-blue-400" : ""}
            `}
          >
            {/* Etiqueta de subasta propia */}
            {isOwnAuction && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs py-1.5 px-3 rounded-full shadow-md font-medium z-10">
                Tu subasta
              </div>
            )}

            {/* Imagen de la subasta */}
            <div className="h-56 w-full overflow-hidden relative">
              {auction.image ? (
                <img
                  src={`http://127.0.0.1:8090/api/files/auctions/${auction.id}/${auction.image}`}
                  alt={auction.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <span className="text-gray-500 font-medium">Sin imagen</span>
                </div>
              )}

              {/* Overlay con tiempo restante */}
              {!isReallyFinished && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white p-2 flex justify-center">
                  <div className="flex items-center space-x-1">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span
                      className={`text-sm font-medium ${
                        isEndingSoon ? "text-amber-300" : "text-white"
                      }`}
                    >
                      {formatTimeLeft(auction.end_time)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Información de la subasta */}
            <div className="p-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {auction.title}
              </h2>
              {isEndingSoon && !isReallyFinished && (
                <div className="mb-2 flex justify-center">
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-md animate-[pulse_1.5s_infinite]">
                    ¡TERMINA PRONTO!
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm flex items-center">
                  {isOwnAuction ? (
                    <>
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="font-medium">Tu subasta</span>
                    </>
                  ) : (
                    <>
                      Creado por:{" "}
                      {auction.expand?.user?.name || "Usuario desconocido"}
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
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

              {/* Botón para pujar o mensaje de subasta propia o finalizada */}
              {isReallyFinished ? (
                <div className="bg-gray-100 border border-gray-300 text-gray-500 p-3 rounded-xl text-center font-semibold">
                  <p className="flex items-center justify-center text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Subasta finalizada
                  </p>
                </div>
              ) : isOwnAuction ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-xl text-center">
                  <p className="flex items-center justify-center text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
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
                    No puedes pujar en tu propia subasta
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => toggleBidForm(auction.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                  disabled={isReallyFinished}
                >
                  {bidForms[auction.id] ? "Cancelar" : "Pujar"}
                </button>
              )}

              {/* Formulario de puja (solo si no es subasta propia y no está finalizada) */}
              {!isOwnAuction && !isReallyFinished && bidForms[auction.id] && (
                <div className="mt-4 border-t border-gray-200/50 pt-4">
                  <div className="mb-3">
                    <label
                      htmlFor={`bid-${auction.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tu oferta (${auction.current_price.toLocaleString()} o
                      más):
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
                      className="mt-2 w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleSubmitBid(auction)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    Confirmar puja
                  </button>
                  {bidError[auction.id] && (
                    <p className="text-red-500 text-sm mt-2 bg-red-50/60 p-2 rounded-lg">
                      {bidError[auction.id]}
                    </p>
                  )}
                </div>
              )}

              {/* Mensaje de error si no está autenticado y trató de pujar */}
              {!isOwnAuction &&
                !bidForms[auction.id] &&
                bidError[auction.id] && (
                  <p className="text-red-500 text-sm mt-2 bg-red-50/60 p-2 rounded-lg">
                    {bidError[auction.id]}
                  </p>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuctionList;
