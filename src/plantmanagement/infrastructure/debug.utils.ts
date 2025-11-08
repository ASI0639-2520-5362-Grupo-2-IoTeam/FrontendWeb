/**
 * Utilidades para debugging de la API de plantas
 */

/**
 * Decodifica un token JWT y muestra su información
 */
export function debugToken(): void {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('❌ No hay token en localStorage');
    return;
  }

  try {
    const parts = token.split('.');
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    console.group('🔍 Token JWT Debug');
    console.log('📋 Header:', header);
    console.log('📦 Payload:', payload);
    console.log('🆔 User ID:', payload.sub || payload.userId);
    console.log('📧 Email:', payload.email);
    console.log('🏷️ Role:', payload.role);
    console.log('⏰ Issued At:', new Date(payload.iat * 1000).toLocaleString());
    console.log('⏰ Expires At:', new Date(payload.exp * 1000).toLocaleString());

    const now = Date.now();
    const exp = payload.exp * 1000;
    const isExpired = now > exp;
    const timeLeft = exp - now;
    const minutesLeft = Math.floor(timeLeft / 1000 / 60);

    console.log('⏱️ Estado:', isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO');
    if (!isExpired) {
      console.log(`⏱️ Tiempo restante: ${minutesLeft} minutos`);
    }
    console.groupEnd();

  } catch (error) {
    console.error('❌ Error al decodificar token:', error);
  }
}

/**
 * Verifica el estado de autenticación
 */
export function debugAuth(): void {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userUuid');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  console.group('🔐 Estado de Autenticación');
  console.log('Token:', token ? '✅ Presente' : '❌ Ausente');
  console.log('User ID:', userId || '❌ Ausente');
  console.log('Email:', email || '❌ Ausente');
  console.log('Role:', role || '❌ Ausente');
  console.groupEnd();

  if (token) {
    debugToken();
  }
}

/**
 * Simula una request HTTP y muestra los headers que se enviarían
 */
export function debugRequestHeaders(endpoint: string, method: string = 'GET'): void {
  const token = localStorage.getItem('token');

  console.group(`📤 Request Debug: ${method} ${endpoint}`);
  console.log('Headers:');
  console.log({
    'Authorization': token ? `Bearer ${token}` : '❌ MISSING',
    'Content-Type': 'application/json'
  });
  console.groupEnd();
}

/**
 * Valida el payload antes de enviarlo al backend
 */
export function validatePlantPayload(payload: any): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar campos requeridos
  if (!payload.name || !payload.name.trim()) {
    errors.push('El campo "name" es requerido y no puede estar vacío');
  }

  if (!payload.type || !payload.type.trim()) {
    errors.push('El campo "type" es requerido y no puede estar vacío');
  }

  // Nuevo contrato: se permite userId y debe ser UUID válido (formato simple)
  if (!payload.userId || typeof payload.userId !== 'string' || payload.userId.trim().length === 0) {
    errors.push('El campo "userId" es requerido y debe ser un string no vacío');
  }

  // Verificar campos autogenerados que NO deben enviarse
  if (payload.id !== undefined) {
    warnings.push('El campo "id" será ignorado - el backend lo genera automáticamente');
  }

  if (payload.createdAt !== undefined) {
    warnings.push('El campo "createdAt" será ignorado - el backend lo genera automáticamente');
  }

  if (payload.updatedAt !== undefined) {
    warnings.push('El campo "updatedAt" será ignorado - el backend lo genera automáticamente');
  }

  // Validar URL de imagen si existe
  if (payload.imgUrl && payload.imgUrl.trim()) {
    try {
      new URL(payload.imgUrl);
    } catch {
      errors.push('El campo "imgUrl" debe ser una URL válida');
    }
  }

  // Validar status si se incluye (opcional en create)
  const validStatuses = ['healthy', 'warning', 'critical', 'HEALTHY', 'WARNING', 'CRITICAL'];
  if (payload.status && !validStatuses.includes(payload.status)) {
    errors.push(`El campo "status" debe ser uno de: ${validStatuses.join(', ')}`);
  }

  // Mostrar resultados
  console.group('✅ Validación de Payload');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ El payload es válido');
  } else {
    if (errors.length > 0) {
      console.error('❌ Errores:', errors);
    }
    if (warnings.length > 0) {
      console.warn('⚠️ Advertencias:', warnings);
    }
  }

  console.log('📦 Payload:', payload);
  console.groupEnd();

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Analiza un error HTTP y proporciona información útil
 */
export function debugHttpError(error: any): void {
  console.group('❌ HTTP Error Debug');

  if (!error.response) {
    console.error('⚠️ Error de red o CORS:', error.message);
    console.log('Posibles causas:');
    console.log('- Backend no está corriendo');
    console.log('- CORS no configurado correctamente');
    console.log('- URL incorrecta');
  } else {
    const { status, data, config } = error.response;

    console.log('📊 Status:', status);
    console.log('📦 Response Data:', data);
    console.log('🔗 URL:', config.url);
    console.log('🔧 Method:', config.method?.toUpperCase());
    console.log('📤 Request Headers:', config.headers);
    console.log('📥 Request Data:', config.data);

    // Análisis específico por código de estado
    switch (status) {
      case 400:
        console.error('❌ Bad Request - Datos inválidos');
        console.log('✅ Solución: Verificar el payload enviado');
        break;

      case 401:
        console.error('❌ Unauthorized - Token inválido o expirado');
        console.log('✅ Solución: Renovar token o iniciar sesión nuevamente');
        debugToken();
        break;

      case 403:
        console.error('❌ Forbidden - Sin permisos');
        console.log('✅ Solución: Verificar que el recurso pertenece al usuario');
        break;

      case 404:
        console.error('❌ Not Found - Recurso no existe');
        console.log('✅ Solución: Verificar el ID del recurso');
        break;

      case 409:
        console.error('❌ Conflict - Race condition detectada');
        console.log('✅ Solución: Reintentar la operación');
        break;

      case 500:
        console.error('❌ Internal Server Error - Error del servidor');
        console.log('✅ Solución: Revisar logs del backend');
        break;

      default:
        console.error(`❌ Error ${status}`);
    }
  }

  console.groupEnd();
}

/**
 * Compara dos plantas y muestra las diferencias
 */
export function comparePlants(plant1: any, plant2: any, label1 = 'Planta 1', label2 = 'Planta 2'): void {
  console.group(`🔍 Comparación de Plantas: ${label1} vs ${label2}`);

  const keys = new Set([...Object.keys(plant1), ...Object.keys(plant2)]);

  keys.forEach(key => {
    const val1 = plant1[key];
    const val2 = plant2[key];

    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      console.log(`📝 ${key}:`);
      console.log(`  ${label1}:`, val1);
      console.log(`  ${label2}:`, val2);
    }
  });

  console.groupEnd();
}

/**
 * Exporta todas las utilidades para uso en consola
 */
if (typeof window !== 'undefined') {
  (window as any).plantDebug = {
    debugToken,
    debugAuth,
    debugRequestHeaders,
    validatePlantPayload,
    debugHttpError,
    comparePlants
  };

  console.log(`
🔧 Utilidades de Debug disponibles en window.plantDebug:

- debugToken()                         : Decodifica y muestra info del token JWT
- debugAuth()                          : Muestra estado de autenticación
- debugRequestHeaders(endpoint, method): Muestra headers de una request
- validatePlantPayload(payload)        : Valida un payload antes de enviarlo
- debugHttpError(error)                : Analiza un error HTTP
- comparePlants(plant1, plant2)        : Compara dos plantas

💡 Ejemplo:
  plantDebug.debugAuth()
  `);
}
