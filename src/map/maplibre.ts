import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// MapLibre 6 worker'ı ayrı ESM dosyası olarak dağıtıyor; Vite'ın çıktıya kopyalaması için ?url ile alıyoruz
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'

maplibregl.setWorkerUrl(workerUrl)

export default maplibregl
