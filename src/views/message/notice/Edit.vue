<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 机构管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'message_notice'}"> <icon-font class="icon" type="icon-dynamic" /> 站点动态</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (this.form.id ? '编辑 [' + this.form.title + '] ': '添加') + '站点动态' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(this.form.id ? '编辑 [' + this.form.title + '] ': '添加') + '站点动态'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit" />
      </template>

      <a-spin :spinning="this.spinning">
        <div class="margin-md-bottom ">
         <a-upload-dragger class="margin-auto padding-none" style="height: 355px;width: 627px" :max-count="1" :showUploadList="false" action="/api/resources/attachment/singleUpload/notice.cover" @change="coverChange" v-model:file-list="coverFile">
            <div v-if="!this.form.cover">
              <div v-if="coverFile.length <= 0">
                <p class="ant-upload-drag-icon" >
                  <icon-font type="icon-image-text" />
                </p>
                <p class="ant-upload-text">点击或拖拽文件到该区域进行上传动态封面。</p>
                <div class="ant-upload-hint">
                  <p>建议图片大小为:627 * 355 像素</p>
                  <p>支持格式为:jpg, jpeg, png</p>
                </div>
              </div>
            </div>
           <img v-else :style="{width:'627px', height: '355px'}" :src="'/api/resources/attachment/query?bucketName=' + this.form.cover.bucket +  '&objectName=' + this.form.cover.object ">
          </a-upload-dragger>
        </div>
        <p class="text-center margin-md-top" v-if="this.form.cover">
          <a-typography-text type="secondary">点击或拖拽文件到封面区域进行上传动态封面</a-typography-text>
        </p>
        <a-form ref="edit-form" :model="this.form" :rules="this.rules" layout="vertical">

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="类型:" name="type">
                <a-select class="width-100-percent" v-model:value="form.type">
                  <a-select-option v-for="(name, value) of typeOptions" :key="name" :value="name">
                    {{value}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="标题:" name="title">
                <a-input v-model:value="form.title" />
              </a-form-item>
            </a-col>
          </a-row>

          <pre-upload-preview v-model:file-list="this.fileList" />
          <post-upload-preview v-if="this.form.attachmentList.length > 0" v-model:meta="this.form.attachmentList" :delete-query="'id=' + this.form.id + '&type=notice'"/>

          <a-form-item label="内容:" name="content" :rules="[{ required: true, validator:this.quillOption.validate, trigger:'change', message:'请输入内容'}]">
            <quill-editor ref="content" @textChange="this.$refs['edit-form'].validateFields('content')" :toolbar="this.quillOption.modules.toolbar" theme="snow" v-model:content="this.form.content" content-type="html" />
          </a-form-item>

          <a-form-item label="备注:" name="remark">
            <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
          </a-form-item>

        </a-form>

        <a-divider />

        <a-space>
          <a-button @click="submitForm(false)" v-if="this.principal.hasPermission('perms[notice:save]')" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-save" />
            <span class="hidden-xs hidden-sm hidden-md">保存</span>
          </a-button>
          <a-button type="primary" @click="submitForm(true)" v-if="this.principal.hasPermission('perms[notice:save]')" :loading="this.spinning">
            <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
            <span class="hidden-xs hidden-sm hidden-md">保存并发</span>
          </a-button>
          <a-upload v-if="principal.hasPermission('perms[notice:save]')" :showUploadList="false" :multiple="true" v-model:file-list="fileList" :before-upload="beforeUpload" @change="fileListChange">
            <a-button>
              <icon-font class="icon" type="icon-attachment" />
              <span class="hidden-xs hidden-sm hidden-md">上传附件</span>
            </a-button>
          </a-upload>
        </a-space>

      </a-spin>

    </a-card>
  </div>
</template>

<script>

import { QuillEditor } from '@vueup/vue-quill'

import '@vueup/vue-quill/dist/vue-quill.snow.css';

import PreUploadPreview from "@/components/file/PreUploadPreview"
import PostUploadPreview from "@/components/file/PostUploadPreview"

export default {
  name:"MessageNoticeEdit",
  components:{QuillEditor, PreUploadPreview, PostUploadPreview},
  inject:['reload'],
  data() {
    return {
      fileList:[],
      coverFile:[],
      spinning:true,
      loadAttachmentCount:0,
      typeOptions:[],
      form: {
        id: null,
        title: "",
        content: "",
        type: "",
        attachmentList:[],
        cover:undefined,
        remark:""
      },
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "change" }],
        type: [{ required: true, message: "请选择类型", trigger: "change" }]
      }
    }
  },
  methods: {
    coverChange(info) {
      if (info.file.status === "done") {
        this.form.cover = info.file.response.data;
        this.form.cover.size = info.file.size;
        this.form.cover.type = "notice.cover";
      }
    },
    fileListChange(e) {
      let exist = e.fileList.filter(f => this.form.attachmentList.filter(m => m.originalFileName).map(m => m.originalFileName).includes(f.name));
      if (!exist || exist.length <= 0) {
        return ;
      }

      this.$message.warn(exist.map(e => e.name).join(",") + " 文件已存在，要替换文件请先删除存在文件。");

      exist.forEach(e => {
        let index = this.fileList.indexOf(e);
        this.fileList.splice(index, 1);
      });
    },
    beforeUpload() {
      return false;
    },
    submitForm(publish) {
      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        if (this.fileList.length > 0) {
          let promise = this.fileList.map(f => this.uploadFile(f, "message",{prefix:'notice'}));
          Promise
              .all(promise)
              .then((values) => {
                values.forEach(v => this.form.attachmentList.push(v.data));
                this.submitFormData(publish);
              })
              .catch(() => this.spinning = false);
        } else {
          this.submitFormData(publish)
        }
      });
    },
    submitFormData(publish) {

      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        this
            .$http
            .post("/api/message/notice/save?publish=" + publish,this.form)
            .then((r) => {
              let id = r.data.data;
              this.$message.success(r.data.message);

              this.spinning = false;

              if (id !== this.form.id) {
                this
                    .$router
                    .push({name:"message_notice_edit", query:{id}, replace:true})
                    .then(() => this.reload());
              } else {
                this.reload();
              }

            })
            .catch(() => this.spinning = false);

      });

    }
  },
  mounted() {
    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/api/message/notice/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;
            this.form.type = this.form.type.value;

            if (!this.form.attachmentList) {
              this.form.attachmentList = [];
            }

            this.loadAttachmentCount = this.form.attachmentList.length;
            this.$refs["content"].setContents(this.form.content);
            this.spinning = false;
          })
          .catch(() => this.spinning = false);

    } else {
      this.spinning = false
    }
  },
  created() {
    this.loadConfigEnumerate({service:"message", enumerateName:"NoticeMessageTypeEnum"}).then((r) => this.typeOptions = r.data.data);
  }
}
</script>