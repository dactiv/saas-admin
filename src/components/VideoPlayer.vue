<template>
  <div>
    <video ref="video-player" class="video-js"></video>
  </div>
</template>

<script>

import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default {
  name: 'VideoPlayer',
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      player: null
    }
  },
  mounted() {
    let language = require("video.js/dist/lang/" + this.$store.state.locale.video + ".json");
    videojs.addLanguage(this.$store.state.locale.video, language);
    this.options.language = this.$store.state.locale.video;
    this.player = videojs(this.$refs['video-player'], this.options);
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }
}
</script>