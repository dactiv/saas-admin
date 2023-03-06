<template>
  <a-list v-if="this.fileListValue.length > 0" class="margin-lg-bottom attachment" item-layout="horizontal" :data-source="this.fileListValue">
    <template #header>
      <icon-font class="icon" type="icon-attachment" />
      待上传文件
    </template>
    <template #renderItem="{ item:fileItem }">
      <a-list-item :key="fileItem.uid">
        <template #actions>
          <a-button danger type="primary" @click="this.confirm('确定删除 [' +  fileItem.name + '] 文件吗?', () => deleteFile(fileItem.uid))">
            <icon-font class="icon" type="icon-ashbin" />
            <span class="hidden-xs hidden-sm hidden-md">删除</span>
          </a-button>
        </template>
        <a-list-item-meta>
          <template #title>
            <a-typography-text :type="getFileItemStatusClass(fileItem)" :ellipsis="{tooltip: fileItem.name + ' ' + byteFormat(fileItem.size)}" :content="fileItem.name + ' ' + byteFormat(fileItem.size)" />
          </template>
          <template #description>
            <a-progress :percent="fileItem.percent" :status="fileItem.status === 'uploading' ? 'active' : fileItem.status === 'error' ? 'exception' : fileItem.status === 'done' ? 'success' : 'normal'" />
          </template>
          <template #avatar>
            <a-typography-text :type="getFileItemStatusClass(fileItem)">
              <icon-font class="icon file" :type="getFileIcon(fileItem.name)" />
            </a-typography-text>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
</template>

<script>
export default {
  name: "PreFileUploadPreview",
  emits:["update:fileList"],
  watch:{
    fileList:{
      deep:true,
      handler(newValue) {
        this.fileListValue = newValue;
      }
    }
  },
  props:{
    fileList:{
      type:Array,
      required:true
    }
  },
  methods: {
    deleteFile(object) {
      let localFile = this.fileListValue.find(a => a.uid === object);
      let index = this.fileListValue.indexOf(localFile);
      this.fileListValue.splice(index, 1);
      this.$emit("update:fileList",this.fileListValue);
    }
  },
  data() {
    return {
      fileListValue:this.fileList
    }
  }
}
</script>