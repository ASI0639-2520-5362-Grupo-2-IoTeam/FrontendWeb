export interface Plant {
    /** Identificador único de la planta. */
    id: number;

    /** El ID del usuario al que pertenece esta planta (relación). */
    userId: number;

    /** Nombre común de la planta (ej: "Monstera Deliciosa"). */
    name: string;

    /** Tipo o categoría de la planta (ej: "Tropical", "Succulent"). */
    type: string;

    /** URL o ruta a la imagen de la planta. */
    imgUrl: string;

    /** Nivel de humedad registrado (en porcentaje). */
    humidity: number;

    /** Texto que indica la última vez que fue regada. */
    lastWatered: string;

    /** Texto que indica cuándo debe ser regada nuevamente. */
    nextWatering: string;

    /** Estado actual de salud. */
    status: 'healthy' | 'warning' | 'critical';

    /** Descripción biográfica de la planta. */
    bio: string;

    /** Ubicación física de la planta. */
    location: string;
}
