import { useEffect, useMemo, useState } from 'react'
import { loadLegacyScripts, resetLegacyLoader } from './legacy/loadLegacyScripts.js'

const LEGACY_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@simonwep/selection-js/lib/selection.min.js',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
  '/js/libraries/sortable.min.js',
  '/js/libraries/range-slider.min.js',
  '/js/libraries/jquery.nice-select.min.js',
  'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js',
  '/js/libraries/localbase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/460/fabric.min.js',
  '/js/libraries/anime.min.js',
  '/js/libraries/ffmpeg.min.js',
  'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js',
  '/js/init.js',
  '/js/ui.js',
  '/js/align.js',
  '/js/converter.js',
  '/js/database.js',
  '/js/lottie.js',
  '/js/text.js',
  '/js/recorder.js',
  '/js/functions.js',
  '/js/events.js',
]

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10, 12, 16, 0.85)',
  color: '#fff',
  zIndex: 999999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
}

// Keeping this giant HTML blob outside the component prevents re-allocating it on every render
// (which happens several times while scripts load).
const LEGACY_MARKUP = `
<div id="disclaimer">
				<div id="optimized">
					<div id="emoji">🤔</div>
					<div id="opt-title">Motionity isn't optimized for mobile</div>
					<div id="opt-desc">You need to use a computer to be able to create animations with Motionity.</div>
					<a href="https://twitter.com/alyssaxuu" target="_blank" rel="noreferrer" id="opt-button">Other products by the maker</a>
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
								<option value="Kodachrome">Kodachrome</option>
								<option value="Polaroid">Polaroid</option>
							</select>
							<hr>
							<div id="filters-title">Adjustments</div>
							<div id="reset-filters"><img src="assets/repeat.svg"> Reset</div>
							<div class="filter-row">
								<th class="name-col">Brightness</th>
								<th class="value-col">
									<div id="filter-brightness" class="select-filter"></div>
								</th>
							</div>
							<div class="filter-row">
								<th class="name-col">Contrast</th>
								<th class="value-col">
									<div id="filter-contrast" class="select-filter"></div>
								</th>
							</div>
							<div class="filter-row">
								<th class="name-col">Saturation</th>
								<th class="value-col">
									<div id="filter-saturation" class="select-filter"></div>
								</th>
							</div>
							<div class="filter-row">
								<th class="name-col">Vibrance</th>
								<th class="value-col">
									<div id="filter-vibrance" class="select-filter"></div>
								</th>
							</div>
							<div class="filter-row">
								<th class="name-col">Hue</th>
								<th class="value-col">
									<div id="filter-hue" class="select-filter"></div>
								</th>
							</div>
							<hr>
							<div id="filters-title">Chroma key</div>
							<div class="filter-row">
								<th class="name-col">Status</th>
								<th class="value-col">
									<div id="status-toggle">
										<div id="status-on" class="status-trigger">On</div>
										<div id="status-off" class="status-trigger status-active">Off</div>
									</div>
								</th>
							</div>
							<div class="filter-row" id="filter-color">
								<th class="name-col">Color</th>
								<th class="value-col">
									<div id="chroma-color">
										<div id="color-chroma-side" class="color-picker"></div>
										<input value="#FFFFFF" disabled="disabled">
									</div>
								</th>
							</div>
							<div class="filter-row">
								<th class="name-col">Distance</th>
								<th class="value-col">
									<div id="chroma-distance" class="select-filter"></div>
								</th>
							</div>
							<hr>
							<div id="filters-title">Stylize</div>
							<div class="filter-row">
								<th class="name-col">Noise</th>
								<th class="value-col">
									<div id="filter-noise" class="select-filter"></div>
								</th>
							</div>
							<div class="filter-row" id="blur">
								<th class="name-col">Blur</th>
								<th class="value-col">
									<div id="filter-blur" class="select-filter"></div>
								</th>
							</div>
						</div>
						</div>
						</div>
						<div id="top-canvas">
							<div id="undo"><img src="assets/undo.svg"> Undo</div>
							<div id="redo"><img src="assets/undo.svg"> Redo</div>
							<div id="other-controls">
                <div title="Hand tool (Space bar)" id="hand-tool">
                    <img src="assets/hand-tool.svg">
                </div>
                <div id="zoom-level" title="Canvas zoom level"><span>100%</span><img src="assets/arrow.svg"></div>
                <div id="zoom-options" class="zoom-hidden">
                    <div class="zoom-options-item" data-zoom="in">Zoom in</div>
                    <div class="zoom-options-item" data-zoom="out">Zoom out</div>
                    <div class="zoom-options-item" data-zoom="50">Zoom to 50%</div>
                    <div class="zoom-options-item" data-zoom="100">Zoom to 100%</div>
                    <div class="zoom-options-item" data-zoom="200">Zoom to 200%</div>
                </div>
            	</div>
						</div>
						<div id="bottom-canvas">
							<a id="sponsor" href="https://github.com/sponsors/alyssaxuu" target="_blank" rel="noreferrer"><img src="assets/sponsor.svg"> Sponsor</a>
							<a id="alyssa-credit" href="https://twitter.com/alyssaxuu" target="_blank" rel="noreferrer">Made by <span>Alyssa X</span> <img src="assets/alyssaimg.jpeg"></a>
						</div>
            <img src="assets/replace-image.svg" id="replace-image">
						<img src="assets/loading-image.svg" id="load-image" class="load-media">
						<img src="assets/loading-video.svg" id="load-video" class="load-media">
            <canvas id="canvas"></canvas>
        </div>
        <div id="timeline-handle"></div>
        <div id="bottom-area" class="noselect">
            <div id="keyframe-properties">
                <div id="easing">
                    <p class="property-title">Keyframe easing</p>
                    <select id="easing">
                        <option value="linear">Linear</option>
                        <option value="easeInQuad">Ease in</option>
                        <option value="easeOutQuad">Ease out</option>
                        <option value="easeinOutQuad">Ease in-out</option>
                        <option value="easeOutInQuad">Ease out-in</option>
												<option value="easeInBounce">Ease in bounce</option>
                        <option value="easeOutBounce">Ease out bounce</option>
                        <option value="easeinOutBounce">Ease in-out bounce</option>
                        <option value="easeOutInBouce">Ease out-in bounce</option>
												<option value="easeOutInBouce">Ease out-in bounce</option>
												<option value="easeInSine">Ease in sine</option>
                        <option value="easeOutSine">Ease out sine</option>
                        <option value="easeinOutSine">Ease in-out sine</option>
                        <option value="easeOutInSine">Ease out-in sine</option>
												<option value="easeOutInSine">Ease out-in sine</option>
												<option value="easeInCubic">Ease in cubic</option>
                        <option value="easeOutCubic">Ease out cubic</option>
                        <option value="easeinOutCubic">Ease in-out cubic</option>
                        <option value="easeOutInCubic">Ease out-in cubic</option>
												<option value="easeOutInCubic">Ease out-in cubic</option>
                    </select>
                </div>
            </div>
            <div id="nothing"></div>
            <div id="layer-list">
                <div id="layerhead">LAYERS</div>
                <div id="layer-inner-list">
									<img src="assets/nolayers.svg" id="nolayers">
                </div>
            </div>
            <div id="timearea">
                <div id="timeline">
                    <div id="seekarea"><div id="inner-seekarea"><div id="seekevents"></div></div><div id="time-numbers" class="noselect"></div><div id="seek-hover"></div><div id="seekbar"></div></div>
                    <div id="line-snap"></div>
                    <div id="inner-timeline"></div>
                </div>
            </div>
        </div>
        <div style="display:none;">
            <canvas id="canvasrecord"></canvas>
        </div>
        <div id="controls" class="noselect">
            <img id="timeline-big" src="assets/timeline-big.svg">
            <div id="timeline-zoom"></div>
            <img src="assets/timeline-small.svg" id="timeline-small">
						<div id="speed">
							<div id="speed-settings">
								<div class="speed" data-speed="4">4.0x</div>
								<div class="speed" data-speed="3">3.0x</div>
								<div class="speed" data-speed="2">2.0x</div>
								<div class="speed" data-speed="1.5">1.5x</div>
								<div class="speed" data-speed="1">1.0x</div>
								<div class="speed" data-speed="0.5">0.5x</div>
							</div>
							<img src="assets/zap.svg"> <span>1.0x</span> <img id="speed-arrow" src="assets/arrow.svg">
						</div>
            <div id="playback">
                <div id="current-time">
                    <input value="00:00:00" readonly>
                </div>
                <img src="assets/skip.svg" id="skip-backward">
                <img src="assets/play-button.svg" id="play-button">
                <img src="assets/skip.svg" id="skip-forward">
                <img src="assets/repeat.svg" id="loop-toggle">
                <div id="total-time">
                    <input value="00:00:00" readonly>
                </div>
            </div>
						<div id="controls-right">
							<div id="share"><img src="assets/importexport.svg"> Import & export</div>
							<div id="download"><img src="assets/download-icon.svg"> Download</div>
						</div>
        </div>
        
        <video id="test-video"></video>
        <input id="emptyInput" value=" " style="opacity:0">
`

const LEGACY_DANGEROUS = { __html: LEGACY_MARKUP }

function LegacyEditor() {
  const [status, setStatus] = useState({
    phase: 'loading',
    loaded: 0,
    total: LEGACY_SCRIPTS.length,
    src: '',
    error: null,
  })

  const percent = useMemo(() => {
    if (!status.total) return 0
    return Math.min(100, Math.round((status.loaded / status.total) * 100))
  }, [status.loaded, status.total])

  useEffect(() => {
    document.body.setAttribute('draggable', 'false')
    let cancelled = false

    loadLegacyScripts(LEGACY_SCRIPTS, ({ loaded, total, src }) => {
      if (cancelled) return
      setStatus((s) => ({ ...s, phase: 'loading', loaded, total, src }))
    })
      .then(() => {
        if (cancelled) return
        setStatus((s) => ({ ...s, phase: 'ready', error: null }))
      })
      .catch((err) => {
        if (cancelled) return
        setStatus((s) => ({ ...s, phase: 'error', error: err }))
      })

    return () => {
      cancelled = true
    }
  }, [])

  const retry = () => {
    resetLegacyLoader()
    setStatus((s) => ({ ...s, phase: 'loading', error: null }))
    // Force remount-like behavior by reloading the page; safest with legacy globals.
    window.location.reload()
  }

  return (
    <>
      {status.phase !== 'ready' && (
        <div style={overlayStyle} role="status" aria-live="polite">
          <div style={{ width: 520, maxWidth: '90vw' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Loading editor…</div>

            {status.phase === 'loading' && (
              <>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
                  {status.src || 'Starting…'}
                </div>
                <div
                  style={{
                    height: 10,
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: '#51B9F9',
                      transition: 'width 200ms ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>{percent}%</div>
              </>
            )}

            {status.phase === 'error' && (
              <>
                <div style={{ marginTop: 8, color: '#ffb3b3', fontSize: 13 }}>
                  Failed to load editor scripts.
                </div>
                <pre
                  style={{
                    marginTop: 8,
                    whiteSpace: 'pre-wrap',
                    fontSize: 12,
                    opacity: 0.9,
                    background: 'rgba(0,0,0,0.25)',
                    padding: 10,
                    borderRadius: 8,
                  }}
                >
                  {String(status.error?.message || status.error)}
                </pre>
                <button
                  type="button"
                  onClick={retry}
                  style={{
                    marginTop: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="legacy-root" dangerouslySetInnerHTML={LEGACY_DANGEROUS} />
    </>
  )
}

export default LegacyEditor
