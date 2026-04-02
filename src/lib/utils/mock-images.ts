/**
 * Mock Image Generator
 * Gera URLs de imagens para cooperativas de transporte
 */

// Tipos de imagem disponíveis
type ImageType = 'unsplash' | 'dicebear' | 'gradient' | 'placeholder'

interface ImageOptions {
  type?: ImageType
  width?: number
  height?: number
  seed?: string // Para imagens consistentes
}

/**
 * Gera hash numérico de uma string (para cores consistentes)
 */
function stringToHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Gera uma cor hexadecimal baseada em uma string
 */
function stringToColor(str: string): string {
  const hash = stringToHash(str)
  const hue = hash % 360
  return `hsl(${hue}, 65%, 50%)`
}

/**
 * Converte HSL para Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `${f(0)}${f(8)}${f(4)}`
}

/**
 * Gera URL de imagem do Unsplash
 * Categorias: bus, van, transport, travel
 */
function getUnsplashImage(seed: string, width = 400, height = 200): string {
  // Unsplash Source API (gratuita, sem auth)
  // Temas: bus, van, vehicle, transport, travel, road
  const keywords = ['bus', 'van', 'vehicle', 'transport', 'travel']
  const hash = stringToHash(seed)
  const keyword = keywords[hash % keywords.length]

  return `https://source.unsplash.com/random/${width}x${height}/?${keyword}`
}

/**
 * Gera avatar/logo usando DiceBear API
 * Estilos: shapes, identicon, bottts, avataaars
 */
function getDicebearImage(seed: string, width = 400, height = 200): string {
  // DiceBear API v7 (gratuita)
  const style = 'shapes' // Estilo abstrato/geométrico (melhor para logos)
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&width=${width}&height=${height}&backgroundColor=transparent`
}

/**
 * Gera gradiente SVG único baseado no nome
 */
function getGradientImage(seed: string): string {
  const hash = stringToHash(seed)
  const hue1 = hash % 360
  const hue2 = (hash + 120) % 360

  const color1Hex = hslToHex(hue1, 65, 50)
  const color2Hex = hslToHex(hue2, 65, 60)

  const svg = `
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#${color1Hex};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${color2Hex};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#grad)" />
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.3">
        ${seed.substring(0, 2).toUpperCase()}
      </text>
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Gera imagem placeholder com texto
 */
function getPlaceholderImage(seed: string, width = 400): string {
  const color = stringToColor(seed)
  const initials = seed.substring(0, 2).toUpperCase()

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${width}&background=${color.replace('#', '')}&color=fff&bold=true&length=2`
}

/**
 * Gera URL de imagem mock para cooperativas
 *
 * @param cooperativeName - Nome da cooperativa
 * @param options - Opções de customização
 * @returns URL da imagem
 *
 * @example
 * ```ts
 * // Unsplash (fotos reais de transportes)
 * getMockCooperativeImage('Expresso Regional', { type: 'unsplash' })
 *
 * // Dicebear (logos abstratos)
 * getMockCooperativeImage('Viação Nordeste', { type: 'dicebear' })
 *
 * // Gradiente único (baseado no nome)
 * getMockCooperativeImage('TransBrasil', { type: 'gradient' })
 *
 * // Placeholder com iniciais
 * getMockCooperativeImage('Rápido Federal', { type: 'placeholder' })
 *
 * // Auto (escolhe baseado no hash do nome)
 * getMockCooperativeImage('São João', { type: 'auto' })
 * ```
 */
export function getMockCooperativeImage(
  cooperativeName: string,
  options: ImageOptions = {},
): string {
  const {
    type = 'gradient', // Default: gradiente (mais rápido, sem request externo)
    width = 400,
    height = 200,
    seed = cooperativeName,
  } = options

  switch (type) {
    case 'unsplash':
      return getUnsplashImage(seed, width, height)

    case 'dicebear':
      return getDicebearImage(seed, width, height)

    case 'gradient':
      return getGradientImage(seed)

    case 'placeholder':
      return getPlaceholderImage(seed, width)

    default:
      return getGradientImage(seed)
  }
}

/**
 * Pré-gera múltiplas opções de imagens para uma cooperativa
 * Útil para testar diferentes estilos
 */
export function getAllMockImages(cooperativeName: string) {
  return {
    unsplash: getMockCooperativeImage(cooperativeName, { type: 'unsplash' }),
    dicebear: getMockCooperativeImage(cooperativeName, { type: 'dicebear' }),
    gradient: getMockCooperativeImage(cooperativeName, { type: 'gradient' }),
    placeholder: getMockCooperativeImage(cooperativeName, {
      type: 'placeholder',
    }),
  }
}
