import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const brandingDir = join(root, 'assets', 'branding')
const source = join(brandingDir, 'logo-source.png')
const tabSource = join(brandingDir, 'favicon-tab.png')
const publicDir = join(root, 'public', 'branding')

const VALID_FAVICON_SIZES = [32, 48, 64, 128, 180, 192, 512]
const GENERATED_FAVICON_SIZES = [16, 32, 180, 192]

function parsePngDimensions(buffer) {
  if (buffer.length < 24) return null
  const signature = buffer.subarray(0, 8)
  if (signature[0] !== 0x89 || signature[1] !== 0x50 || signature[2] !== 0x4e || signature[3] !== 0x47) {
    return null
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

function validateLogoDimensions(width, height) {
  const isSquare = width === height
  const validFavicon =
    isSquare && VALID_FAVICON_SIZES.includes(width)
  const validHeader = width >= 32 && height >= 32 && width / height >= 0.5 && width / height <= 4
  return { width, height, isSquare, validFavicon, validHeader }
}

async function generateFavicons(buffer, dimensions) {
  const { width, height } = dimensions
  const cropSize = Math.min(width, height)
  const left = Math.floor((width - cropSize) / 2)
  const top = Math.floor((height - cropSize) / 2)

  const square = sharp(buffer).extract({ left, top, width: cropSize, height: cropSize })

  await square.clone().resize(16, 16).png().toFile(join(publicDir, 'favicon-16.png'))
  await square.clone().resize(32, 32).png().toFile(join(publicDir, 'favicon-32.png'))
  await square.clone().resize(32, 32).png().toFile(join(publicDir, 'favicon.png'))
  await square.clone().resize(180, 180).png().toFile(join(publicDir, 'apple-icon.png'))
  await square.clone().resize(192, 192).png().toFile(join(publicDir, 'icon-192.png'))

  return { cropSize, left, top }
}

async function copySquareFavicons(buffer, size) {
  await sharp(buffer).resize(16, 16).png().toFile(join(publicDir, 'favicon-16.png'))
  await sharp(buffer).resize(32, 32).png().toFile(join(publicDir, 'favicon-32.png'))
  await sharp(buffer).resize(32, 32).png().toFile(join(publicDir, 'favicon.png'))
  await sharp(buffer).resize(180, 180).png().toFile(join(publicDir, 'apple-icon.png'))
  await sharp(buffer).resize(192, 192).png().toFile(join(publicDir, 'icon-192.png'))
  return { cropSize: size, left: 0, top: 0 }
}

if (!existsSync(source)) {
  console.warn('[sync-logo] No se encontró assets/branding/logo-source.png; se omite la sincronización.')
  process.exit(0)
}

mkdirSync(publicDir, { recursive: true })

const buffer = readFileSync(source)
const dimensions = parsePngDimensions(buffer)

if (!dimensions) {
  console.error('[sync-logo] assets/branding/logo-source.png no es un PNG válido.')
  process.exit(1)
}

const meta = validateLogoDimensions(dimensions.width, dimensions.height)

if (!meta.validHeader && !meta.validFavicon) {
  console.error(
    `[sync-logo] Dimensiones no válidas (${meta.width}x${meta.height}). ` +
      'Header: mín. 32x32 y relación de aspecto entre 0.5 y 4. ' +
      `Favicon cuadrado directo: ${VALID_FAVICON_SIZES.join(', ')}.`,
  )
  process.exit(1)
}

if (meta.validHeader) {
  copyFileSync(source, join(publicDir, 'logo.png'))
  console.log(`[sync-logo] Logo de header copiado (${meta.width}x${meta.height}) → public/branding/logo.png`)
}

let faviconInfo

if (existsSync(tabSource)) {
  const tabBuffer = readFileSync(tabSource)
  const tabDimensions = parsePngDimensions(tabBuffer)
  if (!tabDimensions) {
    console.error('[sync-logo] assets/branding/favicon-tab.png no es un PNG válido.')
    process.exit(1)
  }
  const tabMeta = validateLogoDimensions(tabDimensions.width, tabDimensions.height)
  if (!tabMeta.isSquare) {
    console.error('[sync-logo] assets/branding/favicon-tab.png debe ser cuadrado.')
    process.exit(1)
  }
  faviconInfo = await copySquareFavicons(tabBuffer, tabDimensions.width)
  meta.faviconGenerated = true
  meta.faviconSource = 'assets/branding/favicon-tab.png'
  console.log(`[sync-logo] Favicon desde assets/branding/favicon-tab.png (${tabDimensions.width}x${tabDimensions.height})`)
} else if (meta.validFavicon) {
  faviconInfo = await copySquareFavicons(buffer, dimensions.width)
  meta.faviconGenerated = true
  meta.faviconSource = 'assets/branding/logo-source.png'
  console.log(`[sync-logo] Favicon copiado (${dimensions.width}x${dimensions.height})`)
} else {
  faviconInfo = await generateFavicons(buffer, dimensions)
  meta.faviconGenerated = true
  meta.faviconSource = 'assets/branding/logo-source.png (recorte cuadrado)'
  console.log(
    `[sync-logo] Favicons generados (${GENERATED_FAVICON_SIZES.join(', ')}px) ` +
      `desde recorte ${faviconInfo.cropSize}x${faviconInfo.cropSize}`,
  )
}

meta.faviconSizes = GENERATED_FAVICON_SIZES

writeFileSync(join(root, 'lib', 'branding', 'logo-meta.json'), `${JSON.stringify(meta, null, 2)}\n`)
