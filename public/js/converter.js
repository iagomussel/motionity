var ffmpegInstance;
var ffmpegLoading = false;

function resetDownloadProgress() {
  $('#download-progress').show();
  $('#download-progress-bar').css('width', '0%');
  $('#download-progress-text').html('0%');
  $('#download-logs').hide().html('');
}

function setDownloadProgress(ratio) {
  var percent = Math.max(0, Math.min(100, Math.round(ratio * 100)));
  $('#download-progress').show();
  $('#download-progress-bar').css('width', percent + '%');
  $('#download-progress-text').html(percent + '%');
}

function appendDownloadLog(message) {
  $('#download-logs').show();
  var log = $('#download-logs').html();
  $('#download-logs').html(log + message + '\n');
}

async function getFFmpeg() {
  if (ffmpegInstance && ffmpegInstance.isLoaded()) {
    return ffmpegInstance;
  }
  if (ffmpegLoading) {
    while (ffmpegLoading) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return ffmpegInstance;
  }
  ffmpegLoading = true;
  var ffmpeg = FFmpeg.createFFmpeg({
    log: true
  });
  ffmpeg.setProgress(function (progress) {
    if (progress && typeof progress.ratio === 'number') {
      setDownloadProgress(progress.ratio);
    }
  });
  ffmpeg.setLogger(function (log) {
    if (log && log.message) {
      appendDownloadLog('[' + log.type + '] ' + log.message);
    }
  });
  await ffmpeg.load();
  ffmpegInstance = ffmpeg;
  ffmpegLoading = false;
  return ffmpegInstance;
}

async function convertStreams(videoBlob, setting) {
  resetDownloadProgress();
  appendDownloadLog('Starting ffmpeg.wasm...');
  try {
    var ffmpeg = await getFFmpeg();
    var inputName = 'input.webm';
    var outputName = setting === 'gif' ? 'output.gif' : 'output.mp4';
    var inputData = await FFmpeg.fetchFile(videoBlob);
    ffmpeg.FS('writeFile', inputName, inputData);
    appendDownloadLog('Encoding started...');
    if (setting === 'gif') {
      await ffmpeg.run(
        '-i',
        inputName,
        '-vf',
        'fps=24,scale=trunc(iw/2)*2:trunc(ih/2)*2',
        outputName
      );
    } else {
      await ffmpeg.run(
        '-i',
        inputName,
        '-c:v',
        'mpeg4',
        '-b:v',
        '6400k',
        '-preset',
        'ultrafast',
        outputName
      );
    }
    var data = ffmpeg.FS('readFile', outputName);
    ffmpeg.FS('unlink', inputName);
    ffmpeg.FS('unlink', outputName);
    appendDownloadLog('Encoding finished.');
    setDownloadProgress(1);
    if (setting === 'gif') {
      var gifBlob = new File([data.buffer], 'test.gif', {
        type: 'image/gif'
      });
      PostBlob(gifBlob);
    } else {
      var mp4Blob = new File([data.buffer], 'test.mp4', {
        type: 'video/mp4'
      });
      PostBlob(mp4Blob);
    }
  } catch (err) {
    appendDownloadLog('Error: ' + err.message);
    $('#download-real').html('Download');
    $('#download-real').removeClass('downloading');
  }
}

function PostBlob(blob) {
  var url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  recording = false;
  currenttime = 0;
  animate(false, 0);
  $('#seekbar').offset({
    left:
      offset_left +
      $('#inner-timeline').offset().left +
      currenttime / timelinetime,
  });
  canvas.renderAll();
  resizeCanvas();
  if (background_audio != false) {
    background_audio.pause();
    background_audio = new Audio(background_audio.src);
  }
  $('#download-real').html('Download');
  $('#download-real').removeClass('downloading');
  $('#download-progress').hide();
  $('#download-logs').hide();
  updateRecordCanvas();
}
