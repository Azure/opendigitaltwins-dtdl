$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const beta = urlParams.get('beta');
  if (beta === 'true') {
    $("#footer").show();
  } else {
    $("#footer").hide();
  }
});

// var myOptions = {
//   autoplay: false,
//   controls: true,
//   width: "100%",
//   height: "400",
//   poster: "",
//   skinConfig: {
//     audioTracksMenu: {
//       enabled: false
//     }
//   },
//   logo: {
//     enabled: false
//   }
// };
// var myPlayer = amp("azuremediaplayer", myOptions);
// myPlayer.src([
//   { src: "https://kevin-usea.streaming.media.azure.net/f207fd9f-d885-46ac-8829-a796c6c69ccc/IotPlugNPlayV11FullMix.ism/manifest", type: "application/vnd.ms-sstr+xml" }],
//   [
//     { src: "https://kevin-usea.streaming.media.azure.net/f207fd9f-d885-46ac-8829-a796c6c69ccc/Iot_PlugNPlay_V08.vtt", srclang: "en", kind: "subtitles", label: "English" }
//   ]);
// myPlayer.addEventListener(amp.eventName.loadedmetadata, function () {
//   if (myPlayer.currentAudioStreamList()) {
//     myPlayer.currentAudioStreamList().switchIndex(0);
//   }
// });



// var myPlayer2 = amp("azuremediaplayer2", myOptions);
// myPlayer2.src([
//   { src: "https://kevin-usea.streaming.media.azure.net/1ec5e2f1-b4d3-4823-bcfb-457abfbb57a4/2019_Msft_PlugPlay_CRADLEPOINT.ism/manifest", type: "application/vnd.ms-sstr+xml" }],
//   [
//     { src: "https://kevin-usea.streaming.media.azure.net/1ec5e2f1-b4d3-4823-bcfb-457abfbb57a4/2019_Msft_PlugPlay_CRADLEPOINT_Cut_11_Final_HRHD_1080p_Prores422HQ_MASTER.ttml.vtt", srclang: "en", kind: "subtitles", label: "English" }
//   ]);

// myPlayer2.addEventListener(amp.eventName.loadedmetadata, function () {
//   if (myPlayer2.currentAudioStreamList()) {
//     myPlayer2.currentAudioStreamList().switchIndex(0);
//   }
// });

// var myPlayer3 = amp("azuremediaplayer3", myOptions);
// myPlayer3.src([
//   { src: "https://kevin-usea.streaming.media.azure.net/1ec5e2f1-b4d3-4823-bcfb-457abfbb57a4/2019_Msft_PlugPlay_CRADLEPOINT.ism/manifest", type: "application/vnd.ms-sstr+xml" }],
//   [
//     { src: "https://kevin-usea.streaming.media.azure.net/1ec5e2f1-b4d3-4823-bcfb-457abfbb57a4/2019_Msft_PlugPlay_CRADLEPOINT_Cut_11_Final_HRHD_1080p_Prores422HQ_MASTER.ttml.vtt", srclang: "en", kind: "subtitles", label: "English" }
//   ]);

// var myPlayer4 = amp("azuremediaplayer4", myOptions);
// myPlayer4.src([
//   { src: "https://kevin-usea.streaming.media.azure.net/1ec5e2f1-b4d3-4823-bcfb-457abfbb57a4/2019_Msft_PlugPlay_CRADLEPOINT.ism/manifest", type: "application/vnd.ms-sstr+xml" }],
//   [
//     { src: "https://kevin-usea.streaming.media.azure.net/1ec5e2f1-b4d3-4823-bcfb-457abfbb57a4/2019_Msft_PlugPlay_CRADLEPOINT_Cut_11_Final_HRHD_1080p_Prores422HQ_MASTER.ttml.vtt", srclang: "en", kind: "subtitles", label: "English" }
//   ]);

//   var myPlayer5 = amp("azuremediaplayer5", myOptions);
// myPlayer5.src([
//   { src: "https://kevin-usea.streaming.media.azure.net/1ec5e2f1-b4d3-4823-bcfb-457abfbb57a4/2019_Msft_PlugPlay_CRADLEPOINT.ism/manifest", type: "application/vnd.ms-sstr+xml" }],
//   [
//     { src: "https://kevin-usea.streaming.media.azure.net/1ec5e2f1-b4d3-4823-bcfb-457abfbb57a4/2019_Msft_PlugPlay_CRADLEPOINT_Cut_11_Final_HRHD_1080p_Prores422HQ_MASTER.ttml.vtt", srclang: "en", kind: "subtitles", label: "English" }
//   ]);

// var myPlayer3 = amp("azuremediaplayer3", myOptions);
// myPlayer3.src([
//   { src: "http://kevin-usea.streaming.media.azure.net/87c22a1f-346d-4af6-ae2c-12068d730068/2019_Msft_PlugPlay_CRADLEPOINT.ism/manifest", type: "application/vnd.ms-sstr+xml" }],
//   [
//     { src: "https://kevin-usea.streaming.media.azure.net/f207fd9f-d885-46ac-8829-a796c6c69ccc/Iot_PlugNPlay_V08.vtt", srclang: "en", kind: "subtitles", label: "english" }
//   ]);

// var myPlayer4 = amp("azuremediaplayer4", myOptions);
// myPlayer4.src([
//   { src: "http://kevin-usea.streaming.media.azure.net/87c22a1f-346d-4af6-ae2c-12068d730068/2019_Msft_PlugPlay_CRADLEPOINT.ism/manifest", type: "application/vnd.ms-sstr+xml" }],
//   [
//     { src: "https://kevin-usea.streaming.media.azure.net/f207fd9f-d885-46ac-8829-a796c6c69ccc/Iot_PlugNPlay_V08.vtt", srclang: "en", kind: "subtitles", label: "english" }
//   ]);
