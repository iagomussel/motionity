import { useEffect } from 'react'

const LEGACY_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@simonwep/selection-js/lib/selection.min.js',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
  '/js/libraries/sortable.min.js',
  '/js/libraries/range-slider.min.js',
  '/js/libraries/jquery.nice-select.min.js',
  'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/460/fabric.min.js',
  '/js/libraries/anime.min.js',
  '/js/libraries/ffmpeg.min.js',
  'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
  '/js/init.js',
  '/js/ui.js',
  '/js/align.js',
  '/js/converter.js',
  '/js/database.js',
  '/js/lottie.js',
  '/js/text.js',
  '/js/recorder.js',
  '/js/functions.js',
  '/js/events.js'
]

function LegacyEditor() {
  useEffect(() => {
    if (window.__legacyScriptsLoaded) return
    let cancelled = false

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = false
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })

    const loadAll = async () => {
      try {
        for (const src of LEGACY_SCRIPTS) {
          if (cancelled) return
          // eslint-disable-next-line no-await-in-loop
          await loadScript(src)
        }
        window.__legacyScriptsLoaded = true
      } catch (err) {
        console.error('Legacy script load failed', err)
      }
    }

    loadAll()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className="legacy-root"
      dangerouslySetInnerHTML={{
        __html: `
<div id="disclaimer">
  <div id="optimized">
    <div id="emoji">🤔</div>
    <div id="opt-title">Motionity isn't optimized for mobile</div>
    <div id="opt-desc">You need to use a computer to be able to create animations with Motionity.</div>
    <a href="https://twitter.com/alyssaxuu" target="_blank" id="opt-button">Other products by the maker</a>
  </div>
  <div id="disc-overlay"></div>
</div>
<audio controls id="audio-thing">
  <source src="assets/audio.wav" type="audio/wav">
</audio>
<input type="file" id="filepick" accept="image/*,video/*,audio/*" multiple>
<input type="file" id="filepick2" accept="audio/*">
<input type="file" id="filepick3" accept="application/json">
<input type="file" id="import" style="display:none" accept='.json' aria-hidden="true" >
<div id="upload-popup">
  <div id="upload-popup-container">
    <div id="upload-popup-header">
      <div id="upload-popup-title">Upload media</div>
      <img id="upload-popup-close" src="assets/close.svg">
    </div>
    <div id="upload-drop-area">
      <div id="upload-drop-group">
        <img src="assets/upload.svg">
        <div id="upload-drop-title">Click to upload</div>
        <div id="upload-drop-subtitle">Or drag and drop a file</div>
      </div>
    </div>
    <div id="upload-link">
      <input id="upload-link-input" placeholder="Paste an image of video URL">
      <div id="upload-link-add">Add</div>
    </div>
  </div>
  <div id="upload-overlay"></div>
</div>
<div id="download-modal">
  <p class="header">Download settings</p>
  <p class="subheader">Formats</p>
  <div id="radio">
    <input class="magic-radio" type="radio" name="radio" id="webm-format" value="webm" checked>
    <label for="webm-format">WEBM video <span>(fastest)</span></label>
    <input class="magic-radio" type="radio" name="radio" value="mp4" id="mp4-format">
    <label for="mp4-format">MP4 video</label>
    <input class="magic-radio" type="radio" name="radio" value="gif" id="gif-format">
    <label for="gif-format">Animated GIF</label>
    <input class="magic-radio" type="radio" name="radio" value="image" id="image-format">
    <label for="image-format">Image</label>
  </div>
  <div id="download-progress">
    <div id="download-progress-bar"></div>
    <div id="download-progress-text">0%</div>
  </div>
  <pre id="download-logs"></pre>
  <div id="download-real">Download</div>
</div>
<div id="import-export-modal">
  <p class="header">Import & export</p>
  <p class="subtitle">Save this project locally, or load an existing one.</p>
  <p class="header-2">Import a project</p>
  <div id="import-project"><img src="assets/import.svg"> <span>Import</span></div>
  <p class="header-2">Export this project</p>
  <div id="export-project"><img src="assets/download-icon.svg"> <span>Export</span></div>
</div>
<div id="background-overlay"></div>
<div id="color-picker"></div>
<div id="color-picker-fill"></div>
<div id="toolbar" class="noselect">
  <div id="logo"><img src="assets/logo.svg"></div>
  <div id="tool-wrap">
    <div class="tool" id="upload-tool"><img src="assets/uploads.svg"><p>Uploads</p></div>
    <div class="tool tool-active" id="shape-tool"><img src="assets/shape-active.svg"><p>Objects</p></div>
    <div class="tool" id="image-tool"><img src="assets/image.svg"><p>Images</p></div>
    <div class="tool" id="text-tool"><img src="assets/text.svg"><p>Text</p></div>
    <div class="tool" id="video-tool"><img src="assets/video.svg"><p>Videos</p></div>
    <div class="tool" id="audio-tool"><img src="assets/audio.svg"><p>Audio</p></div>
    <div class="tool" id="more-tool"><img src="assets/more-hoz.svg"><p>More</p></div>
  </div>
</div>
<div id="more-over">
  <div id="upload-lottie">
    <img src="assets/upload-grey.svg"> Upload Lottie
  </div>
  <div id="clear-project">
    <img src="assets/clear.svg"> Clear project
  </div>
  <div id="local-only-toggle" class="settings-toggle">
    <span>Local-only mode</span>
    <label class="switch">
      <input type="checkbox" id="local-only-checkbox">
      <span class="slider"></span>
    </label>
  </div>
</div>
<div id="behind-browser"></div>
<div id="browser">
  <div id="browser-container">
    <div id="search-fixed"><p class="property-title">Objects</p><img id="collapse" src="assets/collapse.svg"><div id="browser-search"><input placeholder="Search..."><img src="assets/search.svg" id="search-icon"><img src="assets/delete.svg" id="delete-search"><div id="search-button">Go</div></div></div><div id="shapes-cont"><p class="row-title">Shapes</p><div class="gallery-row" id="shapes-row"></div><p class="row-title">Emojis</p><div class="gallery-row" id="emojis-row"></div></div>
  </div>
</div>
<div id="properties">
  <div id="properties-overlay"></div>
  <div id="align" class="align-off">
    <div id="align-v">
      <img class="align" id="align-top" src="assets/align-top.svg" title="Align to the top">
      <img class="align" id="align-center-v" src="assets/align-center-v.svg" title="Align to the center">
      <img class="align" id="align-bottom" src="assets/align-bottom.svg" title="Align to the bottom">
    </div>
    <div id="align-h">
      <img class="align" id="align-left" src="assets/align-left.svg" title="Align to the left">
      <img class="align" id="align-center-h" src="assets/align-center-h.svg" title="Align to the center">
      <img class="align" id="align-right" src="assets/align-right.svg" title="Align to the right">
    </div>
  </div>
  <hr>
  <div id="object-specific">
    <div id="canvas-properties" class="panel-section">
      <p class="property-title">Canvas settings</p>
      <table>
        <tr>
          <th class="name-col">Preset</th>
          <th class="value-col"><select id="preset"><option>Dribbble shot</option><option>Facebook post</option></select></th>
        </tr>
        <tr>
          <th class="name-col">Size</th>
          <th class="value-col"><div id="canvas-w" class="property-input" data-label='W'><input min=1 type="number" value=1000></div><div id="canvas-h" class="property-input" data-label='H'><input type="number" value=1000 min=1></div></th>
        </tr>
        <tr>
          <th class="name-col">Color</th>
          <th class="value-col">
            <div id="canvas-color">
              <div id="color-side" class="color-picker"></div>
              <input value="#FFFFFF" disabled="disabled">
            </div>
            <div id="canvas-color-opacity" class="property-input" data-label='%'><input type="number" value=100></div>
          </th>
        </tr>
        <tr>
          <th class="name-col">Duration</th>
          <th class="value-col" id="duration-cell"><div id="canvas-duration" class="property-input" data-label='s'><input type="number" value=15.00></div></th>
        </tr>
      </table>
    </div>
  </div>
</div>
<div id="canvas-area">
  <div id="filters-parent">
    <div id="filters">
      <div id="filters-container">
        <div id="filters-header">
          <div id="filters-title">Filters</div>
          <img src="assets/close.svg" id="filters-close">
        </div>
        <select id="filters-list">
          <option value="none">No filter</option>
          <option value="Invert">Invert</option>
          <option value="Sepia">Sepia</option>
          <option value="BlackWhite">Black & white</option>
          <option value="Brownie">Retro</option>
          <option value="Vintage">Vintage</option>
          <option value="Technicolor">Technicolor</option>
          <option value="Polaroid">Polaroid</option>
          <option value="Kodachrome">Kodachrome</option>
          <option value="Brightness">Brightness</option>
          <option value="Contrast">Contrast</option>
          <option value="Noise">Noise</option>
          <option value="Pixelate">Pixelate</option>
          <option value="Blur">Blur</option>
          <option value="Sharpen">Sharpen</option>
          <option value="Emboss">Emboss</option>
          <option value="Gamma">Gamma</option>
          <option value="Grayscale">Grayscale</option>
        </select>
        <div id="filters-settings"></div>
      </div>
    </div>
  </div>
  <div id="canvas-wrap">
    <div id="canvas"></div>
    <canvas id="canvas-2"></canvas>
  </div>
</div>
<div id="layers">
  <div id="layers-header">
    <div id="layers-title">Layers</div>
    <img src="assets/close.svg" id="layers-close">
  </div>
  <div id="layers-container"></div>
</div>
<div id="toolbar-2">
  <div id="toolbar-2-left">
    <img src="assets/undo.svg" id="undo">
    <img src="assets/repeat.svg" id="redo">
    <img src="assets/clear.svg" id="clear">
  </div>
  <div id="toolbar-2-center">
    <div id="zoom-level"><span>100%</span></div>
  </div>
  <div id="toolbar-2-right">
    <img src="assets/importexport.svg" id="importexport">
    <img src="assets/download-icon.svg" id="download">
  </div>
</div>
<div id="timeline">
  <div id="timeline-header">
    <div id="timeline-left">
      <div id="playback">
        <div id="current-time"><input value="00:00:00" readonly=""></div>
        <img src="assets/skip.svg" id="skip-backward">
        <img src="assets/play-button.svg" id="play-button">
        <img src="assets/skip.svg" id="skip-forward">
        <div id="total-time"><input value="00:00:00" readonly=""></div>
      </div>
    </div>
    <div id="timeline-center">
      <div id="timeline-zoom">
        <img src="assets/shrink.svg" id="timeline-shrink">
        <img src="assets/scale.svg" id="timeline-scale">
      </div>
    </div>
    <div id="timeline-right">
      <div id="timeline-add">Add media</div>
    </div>
  </div>
  <div id="timeline-wrap">
    <div id="timeline-scroll">
      <div id="timeline-labels"></div>
      <div id="timeline-contents"></div>
    </div>
  </div>
</div>
<div id="cropping-parent">
  <div id="cropping">
    <div id="cropping-header">
      <p class="header">Crop & trim</p>
      <img src="assets/close.svg" id="crop-close">
    </div>
    <div id="cropping-contents">
      <div class="panel-section">
        <p class="property-title">Crop</p>
        <table>
          <tr>
            <th class="name-col">X</th>
            <th class="value-col"><div id="crop-x" class="property-input"><input type="number" value=0></div></th>
          </tr>
          <tr>
            <th class="name-col">Y</th>
            <th class="value-col"><div id="crop-y" class="property-input"><input type="number" value=0></div></th>
          </tr>
          <tr>
            <th class="name-col">Width</th>
            <th class="value-col"><div id="crop-w" class="property-input"><input type="number" value=0></div></th>
          </tr>
          <tr>
            <th class="name-col">Height</th>
            <th class="value-col"><div id="crop-h" class="property-input"><input type="number" value=0></div></th>
          </tr>
        </table>
      </div>
      <div class="panel-section">
        <p class="property-title">Trim</p>
        <table>
          <tr>
            <th class="name-col">Start</th>
            <th class="value-col"><div id="trim-start" class="property-input"><input type="number" value=0></div></th>
          </tr>
          <tr>
            <th class="name-col">End</th>
            <th class="value-col"><div id="trim-end" class="property-input"><input type="number" value=0></div></th>
          </tr>
        </table>
      </div>
    </div>
  </div>
</div>
`
      }}
    />
  )
}

export default LegacyEditor
