<template>

  <a-modal v-if="this.type === 'video'" v-model:visible="this.visibleValue" width="width-lg" :title="this.title" layout="vertical">

  </a-modal>

</template>

<script>

import 'viewerjs/dist/viewer.css'
import { api as viewerApi } from "v-viewer"

export default {
  name: "PreviewModal",
  emits: ["update:visible"],
  watch:{
    visible(newValue) {
      this.visibleValue = newValue;
    }
  },
  props:{
    title: {
      type:String,
      default() {
        return undefined;
      }
    },
    type:{
      type:String,
      default() {
        return "";
      },
    },
    visible:{
      type:Boolean,
      default() {
        return false;
      }
    },
    dataSource:{
      type:Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      image:{
        total:0,
        data:[],
        options:{
          zIndex: 99999,
          inline: true,
          button: false,
          navbar: true,
          title: false,
          toolbar: true,
          tooltip: true,
          movable: true,
          zoomable: true,
          rotatable: true,
          scalable: true,
          transition: true,
          fullscreen: false,
          keyboard: true
        },
        page:{
          elements:[],
          first:true,
          last:true,
          number:1
        }
      },
      visibleValue:this.visible
    }
  },
  methods:{
    showImage() {
      this.$viewerApi({
        images: this.dataSource
      });
    },
    setVisibleValue(value) {
      this.visibleValue = value;
      this.$emit('update:visible', this.visibleValue);
    }
  }
}
</script>