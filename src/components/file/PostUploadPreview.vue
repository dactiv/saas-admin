<template>
  <a-list class="margin-lg-bottom margin-xs-top attachment" item-layout="horizontal" :data-source="this.metaValue">
    <template #header>
      <icon-font class="icon" type="icon-attachment" />
      已上传文件
    </template>
    <template #renderItem="{ item:meta }">
      <a-list-item :key="meta.etag">
        <template #actions>
          <a-space>
            <a-button size="small" :disabled="!this.canPreview(meta)" @click="this.previewFile(meta)">
              <icon-font class="icon" type="icon-browse" />
              <span class="hidden-xs hidden-sm hidden-md">预览</span>
            </a-button>
            <a-button size="small" @click="this.downloadFile(meta.bucket, meta.object, this.downloadQuery)" v-if="this.downloadable">
              <icon-font class="icon" type="icon-download" />
              <span class="hidden-xs hidden-sm hidden-md">下载</span>
            </a-button>
            <a-button size="small" @click="this.deleteFile((meta.type || meta.bucket), meta.object)" v-if="this.removable">
              <icon-font class="icon" type="icon-ashbin" />
              <span class="hidden-xs hidden-sm hidden-md">删除</span>
            </a-button>
          </a-space>
        </template>
        <a-list-item-meta>
          <template #title>
            {{ meta.originalFileName || meta.object}}
            <slot name="titleSuffix" :meta="meta">
              <a-tooltip v-if="meta.status && meta.status === 10">
                <template #title>转换中</template>
                <icon-font spin class="icon" type="icon-dynamic" />
              </a-tooltip>
            </slot>
          </template>
          <template #description>
            大小:{{byteFormat(meta.size)}}
          </template>
          <template #avatar>
            <a-typography-text type="default">
              <icon-font class="icon file" :type="getFileIcon(meta.object)" />
            </a-typography-text>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
  <a-modal :destroy-on-close="true" v-model:visible="this.preview.dialogVisible" :title="this.preview.video.title" class="width-lg">
    <video-player v-if="this.preview.type === 'video'" :options="{controls: true, sources:[{src:this.preview.video.src, type:this.preview.video.type}]}" />
  </a-modal>
</template>

<script>
import {api as viewerApi} from "v-viewer";

import 'viewerjs/dist/viewer.css'

import VideoPlayer from "@/components/VideoPlayer";
export default {
  name: "FilePostUploadPreview",
  emits:["update:meta"],
  components:{VideoPlayer},
  watch:{
    meta:{
      deep:true,
      handler(newValue) {
        this.metaValue = newValue;
      }
    }
  },
  props:{
    downloadable: {
      type:Boolean,
      default: true
    },
    removable:{
      type:Boolean,
      default: true
    },
    meta:{
      type:Array,
      required:true
    },
    downloadQuery:{
      type:String,
      default:undefined
    },
    deleteQuery:{
      type:String,
      default:undefined
    }
  },
  methods: {
    canPreview(meta) {

      if (meta.status === 10) {
        return true;
      }

      let suffix = meta.originalFileName.substring(meta.originalFileName.lastIndexOf(".") + 1, meta.originalFileName.length);

      let flag = ["png", "jpg", 'bmp', 'gif', 'mp4'].includes(suffix);

      if(!flag) {
        flag = ['doc','docx','xls','xlsx','ppt','pptx','pdf','pdfx'].includes(suffix) && meta.image;
      }

      return flag;
    },
    previewFile(meta) {
      let suffix = meta.originalFileName.substring(meta.originalFileName.lastIndexOf(".") + 1, meta.originalFileName.length);

      if (["png", "jpg", 'bmp', 'gif', 'doc','docx','xls','xlsx','ppt','pptx','pdf','pdfx'].includes(suffix)) {
        if (['doc','docx','xls','xlsx','ppt','pptx','pdf','pdfx'].includes(suffix) && meta.image) {
          viewerApi({images: meta.image.map(i => '/api' + i.link)})
        } else {
          viewerApi({images: ['/api' + meta.link]})
        }
      } else if (["mp4"].includes(suffix)) {
        this
            .$http
            .get("/api/resources/attachment/queryPresignedUrl?method=GET&bucketName=" + meta.bucket + "&objectName=" + meta.object)
            .then(r => {
              this.preview.dialogVisible = true;
              this.preview.type = "video";
              this.preview.video.title = meta.originalFileName;
              this.preview.video.type = meta['Content-Type]'];
              this.preview.video.src = r.data.data
            });
      }
    },
    deleteFile(bucket, object) {
      this.confirm("确定删除 [" + object + "] 文件吗？", () => {
        this
            .$http
            .post("/api/resources/attachment/delete" + (this.deleteQuery ? "?" + this.deleteQuery : ""), [{objectName:object, bucketName:bucket}])
            .then(r => {
              this.$message.success(r.data.message)
              let item = this.metaValue.find(m => m.object === object && m.bucket === bucket);
              let index = this.metaValue.indexOf(item);
              this.metaValue.splice(index, 1);
              this.$emit("update:fileList",this.metaValue);
            });
      });

    }
  },
  data() {
    return {
      metaValue:this.meta,
      preview:{
        dialogVisible:false,
        type:undefined,
        video:{
          src:undefined,
          type:undefined,
          title:''
        }
      }
    }
  }
}
</script>