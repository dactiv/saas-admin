<template>

  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-survey" /> 审批管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'workflow_schedule'}"> <icon-font class="icon" type="icon-date-range" /> 日程管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '日程' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '日程'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-form ref="edit-form" :model="this.form" layout="vertical">

          <a-form-item label="日程名称:" name="name" :rules="{ required: true, message: '请输入日程名称', trigger: 'change'}">
            <a-input v-model:value="this.form.name" />
          </a-form-item>

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="开始时间:" name="startTime" :rules="{ required: true, message: '请选择开始时间', trigger: 'change'}">
                <a-date-picker show-time :showNow="false" :format="this.POST_DATETIME_FORMAT" :value-format="this.POST_DATETIME_FORMAT" v-model:value="this.form.startTime" class="width-100-percent" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="结束时间:" name="endTime" :rules="{ required: true, message: '请选择结束时间', trigger: 'change'}">
                <a-date-picker show-time :disabled="!this.form.startTime" :showNow="false" :disabledDate="(currentDate) => this.$dayjs(this.form.startTime).isAfter(currentDate)" :format="this.POST_DATETIME_FORMAT" :value-format="this.POST_DATETIME_FORMAT" v-model:value="this.form.endTime" class="width-100-percent" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="日程内容:" name="content" :rules="{ required: true, validator:this.quillOption.validate, message: '请输入日程内容', trigger: 'change'}">
            <quill-editor ref="content" :toolbar="this.quillOption.modules.toolbar" theme="snow" v-model:content="this.form.content" content-type="html" />
          </a-form-item>

          <a-form-item label="资源文件:" name="meta">
            <a-upload-dragger :showUploadList="false" v-model:file-list="this.fileList" @change="fileListChange" :before-upload="beforeUpload">
              <p class="ant-upload-drag-icon" >
                <icon-font type="icon-image-text" />
              </p>
              <p class="ant-upload-text">点击或拖拽文件到该区域进行上传文件。</p>
            </a-upload-dragger>
          </a-form-item>
          <pre-upload-preview v-model:file-list="this.fileList" />
          <post-upload-preview v-if="this.form.meta.length > 0" :meta="this.form.meta" />

          <a-form-item label="备注:" name="remark">
            <quill-editor ref="remark" :toolbar="this.quillOption.modules.toolbar" theme="snow" v-model:content="this.form.remark" content-type="html" />
          </a-form-item>
          <a-divider orientation="left"><icon-font type="icon-team" /> 参与者信息</a-divider>
          <department-user-select v-model:participant-list="this.form.participantList" />
        </a-form>

        <a-divider />

        <a-space>
          <a-button @click="submitForm(false)" v-if="this.principal.hasPermission('perms[schedule:save]')" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-save" />
            <span class="hidden-xs hidden-sm hidden-md">保存</span>
          </a-button>
          <a-button type="primary" @click="submitForm(true)" v-if="this.principal.hasPermission('perms[schedule:publish]') && this.form.status !== 20" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
            <span class="hidden-xs hidden-sm hidden-md">发布</span>
          </a-button>
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

import DepartmentUserSelect from "@/components/DepartmentUserSelect";

export default {
  name:"ResourcesCurriculumNoticeEdit",
  components:{QuillEditor, PreUploadPreview, PostUploadPreview, DepartmentUserSelect},
  inject:['reload'],
  data() {
    return {
      fileList:[],
      spinning:true,
      form: {
        id:undefined,
        startTime: undefined,
        endTime:undefined,
        name:"",
        content:"",
        remark:"",
        meta:[],
        participantList:[]
      },
    }
  },
  methods: {
    beforeUpload() {
      return false;
    },
    fileListChange(e) {
      let exist = e.fileList.filter(f => this.form.meta.filter(m => m.originalFileName).map(m => m.originalFileName).includes(f.name));
      if (!exist || exist.length <= 0) {
        return ;
      }

      this.$message.warn(exist.map(e => e.name).join(",") + " 文件已存在，要替换文件请先删除存在文件。");

      exist.forEach(e => {
        let index = this.fileList.indexOf(e);
        this.fileList.splice(index, 1);
      });
    },
    submitForm(publish) {
      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        if (this.fileList.length > 0) {
          let promise = this.fileList.map(f => this.uploadFile(f, "temp",{prefix:'schedule_meta'}));
          Promise
              .all(promise)
              .then((values) => {
                values.forEach(v => this.form.meta.push(v.data));
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
            .post("/api/workflow/schedule/save?publish=" + publish,this.form)
            .then((r) => {
              let id = r.data.data;
              this.$message.success(r.data.message);

              this.spinning = false;

              if (id !== this.form.id) {
                this
                    .$router
                    .push({name:"workflow_schedule_edit", query:{id}, replace:true})
                    .then(() => this.reload());
              } else {
                this.reload();
              }

            })
            .catch(() => this.spinning = false);

      });

    }
  },
  created() {

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/api/workflow/schedule/get?id=" + this.$route.query.id)
          .then(r => {

            r.data.data.startTime = this.$dayjs(r.data.data.startTime);
            r.data.data.endTime = this.$dayjs(r.data.data.endTime);

            this.form = r.data.data;

            if (!this.form.meta) {
              this.form.meta = [];
            }

            this.$refs["content"].setContents(this.form.content);
            this.$refs["remark"].setContents(this.form.remark);
            this.spinning = false;
          })
          .catch(() => this.spinning = false);

    } else {

      this.spinning = false
    }
  }
}
</script>