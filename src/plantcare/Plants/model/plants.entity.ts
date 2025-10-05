export interface Plant {
    /** Identificador único de la planta. */
    id: number;

    /** El ID del usuario al que pertenece esta planta (UUID string). */
    userId: string;

    /** Nombre común de la planta (ej: "Monstera Deliciosa"). */
    name: string;

    /** Tipo o categoría de la planta (ej: "Tropical", "Succulent"). */
    type: string;

    /** URL o ruta a la imagen de la planta. */
    imgUrl: string;

    /** Nivel de humedad registrado (en porcentaje). */
    humidity: number;

    /** Texto que indica la última vez que fue regada (ISO string o texto legible). */
    lastWatered: string;

    /** Texto que indica cuándo debe ser regada nuevamente (ISO string o texto legible). */
    nextWatering: string;

    /** Estado actual de salud en minúsculas para facilitar uso en la UI. */
    status: 'healthy' | 'warning' | 'critical';

    /** Descripción biográfica de la planta. */
    bio: string;

    /** Ubicación física de la planta. */
    location: string;

    /** Fechas del backend (opcional). */
    createdAt?: string;
    updatedAt?: string;
}
