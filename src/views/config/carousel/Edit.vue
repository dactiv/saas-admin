<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-enum-major-o" /> 基础信息配置</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'config_carouse'}"><icon-font class="icon" type="icon-carousel" /> 轮播图管理</router-link> </a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '轮播图' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="审计详情" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-file" />
      </template>

      <a-spin :spinning="this.spinning">

        <div class="margin-md-bottom ">
          <div style="width: 100%; height: 420px;" class="margin-auto">
            <a-upload-dragger class="margin-auto padding-none" :max-count="1" :showUploadList="false" v-model:file-list="this.fileList" :before-upload="beforeUpload">
              <a-row class="height-100-percent" v-if="!this.form.cover" type="flex" justify="space-around" align="middle">
                <a-col :span="24">
                  <div >
                    <p class="ant-upload-drag-icon" >
                      <icon-font type="icon-upload" />
                    </p>
                    <p class="ant-upload-text">点击或拖拽文件到该区域进行上传动态封面。</p>
                    <div class="ant-upload-hint">
                      <p>建议图片大小为:1680 * 420 像素</p>
                      <p>支持格式为:jpg, jpeg, png</p>
                    </div>
                  </div>
                </a-col>
              </a-row>
              <img v-else :style="{ maxWidth:'100%', height: '420px'}" :src="'/api/resources/attachment/query?bucketName=' + this.form.cover.bucket +  '&objectName=' + this.form.cover.object ">
            </a-upload-dragger>
          </div>

          <pre-upload-preview v-model:file-list="this.fileList" />

        </div>

        <a-form ref="edit-form" :model="this.form" layout="vertical">
          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="名称:" name="name" :rules="[{ required: true, message: '请输入名称', trigger: 'change'}]">
                <a-input ref="name" v-model:value="this.form.name" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="类型:" name="type">
                <a-select class="width-100-percent" v-model:value="this.form.type">
                  <a-select-option v-for="(value, name) of this.typeOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="链接地址:" :name="['link','value']" :rules="[{ required: true, message: '请输入链接', trigger: 'change'}]">
            <a-input v-model:value="this.form.link.value">
              <template #addonBefore>
                <a-select v-model:value="this.form.link.type" style="width: 90px" :options="this.linkOptions" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="备注:" name="remark">
            <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
          </a-form-item>

        </a-form>

        <a-divider />

        <a-space>
          <a-button @click="submitForm(false)" v-if="this.principal.hasPermission('perms[carousel:save]')" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-save" />
            <span class="hidden-xs hidden-sm hidden-md">保存</span>
          </a-button>
          <a-button type="primary" @click="submitForm(true)" v-if="this.principal.hasPermission('perms[carousel:publish]')" :loading="this.spinning">
            <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
            <span class="hidden-xs hidden-sm hidden-md">保存并发</span>
          </a-button>
        </a-space>

      </a-spin>

    </a-card>
  </div>
</template>

<script>


import PreUploadPreview from "@/components/file/PreUploadPreview"

export default {
  name:"AdminCarouselEdit",
  components:{PreUploadPreview},
  inject:['reload'],
  data() {
    return {
      spinning:true,
      typeOptions:[],
      linkOptions:[{label:'http://', value:'http://'},{lable:'https://',value:'https://'}],
      fileList:[],
      form: {
        name: "",
        type: 10,
        link: {
          type:'http://',
          value:"",
        },
        cover: undefined,
        remark:""
      }
    }
  },
  methods:{
    submitForm(publish) {
      if (!this.form.cover && this.fileList.length <= 0) {
        this.$message.warn("请上传封面图片");
        return ;
      }
      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        if (this.fileList.length > 0) {
          this.uploadFile(this.fileList[0], "carousel.cover")
              .then((value) => {
                this.form.cover = value.data;
                this.submitFormData(publish);
              })
              .catch(() => this.spinning = false);
        } else {
          this.submitFormData(publish)
        }
      });
    },
    submitFormData(publish) {
      if (!this.form.cover && this.fileList.length <= 0) {
        this.$message.warn("请上传封面图片");
        return ;
      }
      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;
        this.linkOptions.forEach(l => this.form.link.value = this.form.link.value.replace(l.value, ""));

        this
            .$http
            .post("/api/admin/carousel/save?publish=" + publish,this.form)
            .then((r) => {
              let id = r.data.data;
              this.$message.success(r.data.message);

              this.spinning = false;

              if (id !== this.form.id) {
                this
                    .$router
                    .push({name:"config_carouse_edit", query:{id}, replace:true})
                    .then(() => this.reload());
              } else {
                this.reload();
              }

            })
            .catch(() => this.spinning = false);

      });

    },
    beforeUpload() {
      return false;
    },
  },
  created() {
    this
        .loadConfigEnumerate({service:"admin", enumerateName:"CarouselType"})
        .then((r) => this.typeOptions = r.data.data);

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/api/admin/carousel/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;
            this.form.type = this.form.type.value;
            this.spinning = false;
          })
          .catch(() => this.spinning = false);

    } else {
      this.spinning = false
    }

  }
}
</script>