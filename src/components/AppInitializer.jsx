import React from 'react'
import api from '../services/api' // Ajusta la ruta a tu archivo de API

// Detectar si está en desarrollo
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

// Hook para el warm-up del backend
const useBackendWarmup = () => {
  const [isWarming, setIsWarming] = React.useState(false)
  const [isReady, setIsReady] = React.useState(isDevelopment) // En desarrollo está listo inmediatamente

  React.useEffect(() => {
    // Solo hacer warm-up en producción
    if (!isDevelopment) {
      const warmupBackend = async () => {
        setIsWarming(true)
        console.log("🔥 Iniciando warm-up del backend...")
        
        try {
          // Intentar hacer ping al backend para despertarlo
          await api.get('/health-check', { 
            timeout: 30000,
            // No usar token para este request
            transformRequest: [(data, headers) => {
              delete headers.Authorization
              return data
            }]
          })
          
          console.log("✅ Backend listo!")
          setIsReady(true)
        } catch (error) {
          console.warn("⚠️ Warm-up falló, pero continuando...", error.message)
          // Aún marcar como listo para no bloquear la app
          setIsReady(true)
        } finally {
          setIsWarming(false)
        }
      }

      warmupBackend()
    }
  }, [])

  return { isWarming, isReady }
}

// Componente de loading
const LoadingSpinner = ({ message = "Cargando..." }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="relative mb-6">
      {/* Logo o nombre de tu gym (opcional) */}
      <div className="text-2xl font-bold text-blue-600 mb-4 text-center">
        Biofitness
      </div>
      
      {/* Spinner animado */}
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
    </div>
    
    <div className="text-center max-w-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {message}
      </h3>
      
      {/* Puntos animados */}
      <div className="flex items-center justify-center space-x-1 mb-4">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
      </div>
      
      <p className="text-sm text-gray-500">
        Esto puede tomar unos segundos
      </p>
      
      {/* Barra de progreso simulada */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
      </div>
    </div>
  </div>
)

// Componente principal que maneja el warm-up
const AppInitializer = ({ children }) => {
  const { isWarming, isReady } = useBackendWarmup()
  const [showDetailedLoading, setShowDetailedLoading] = React.useState(false)
  const [isPreloading, setIsPreloading] = React.useState(false)
  const [preloadError, setPreloadError] = React.useState(null)

  // Precarga de datos críticos
  React.useEffect(() => {
    if (isReady) {
      setIsPreloading(true)
      setPreloadError(null)
      // Importar los servicios aquí para evitar dependencias circulares
      import('../services/managerService').then(({ managerService }) => {
        import('../services/membershipService').then(({ membershipService }) => {
          Promise.all([
            managerService.getLoginList().catch(() => null),
            membershipService.getAllWithDetails().catch(() => null),
          ]).then(() => {
            setIsPreloading(false)
          }).catch((err) => {
            setPreloadError(err)
            setIsPreloading(false)
          })
        })
      })
    }
  }, [isReady])

  // Mostrar mensaje más detallado después de 3 segundos
  React.useEffect(() => {
    if (isWarming) {
      const timer = setTimeout(() => {
        setShowDetailedLoading(true)
      }, 3000)
      
      return () => clearTimeout(timer)
    } else {
      setShowDetailedLoading(false)
    }
  }, [isWarming])

  if (isWarming) {
    return (
      <LoadingSpinner 
        message={
          showDetailedLoading 
            ? "Activando el servidor... Por favor espera" 
            : "Iniciando aplicación..."
        }
      />
    )
  }

  if (!isReady) {
    return <LoadingSpinner message="Preparando aplicación..." />
  }

  if (isPreloading) {
    return <LoadingSpinner message="Cargando información..." />
  }

  if (preloadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar datos críticos</h3>
        <p className="text-gray-600 mb-4">{preloadError.message || 'Error desconocido'}</p>
        <button
          onClick={() => setIsPreloading(true) || setPreloadError(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return children
}

// Hook adicional para usar en tus componentes
export const useApiLoading = () => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const executeRequest = React.useCallback(async (requestFn) => {
    try {
      setLoading(true)
      setError(null)
      const result = await requestFn()
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    executeRequest,
    clearError: () => setError(null)
  }
}

// Componente de error reutilizable
export const ErrorBoundary = ({ error, onRetry, children }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 bg-red-50 rounded-lg p-8 m-4">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Oops! Algo salió mal
        </h3>
        <p className="text-gray-600 text-center mb-4">
          {error.response?.data?.message || error.message || 'Error desconocido'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  return children
}

export default AppInitializer