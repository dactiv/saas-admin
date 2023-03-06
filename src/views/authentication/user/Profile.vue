<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 用户设置 </a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="系统设置" class="basic-box-shadow" style="max-width: 768px;margin:0 auto">

      <template #extra>
        <icon-font class="icon" type="icon-setting" />
      </template>

      <div class="text-center">

        <a-image-preview-group>
          <a-space>
            <div v-for="v of historyAvatar.values" :key="v" class="border padding basic-box-shadow">
              <a-image :width="100" :height="100" :src="'/api/resources/attachment/query?bucketName=cmis.resources.attachment.avatar&objectName=' + v" />
              <p class="margin-none border">
                <a-button type="text" v-if="v !== historyAvatar.currentAvatarFilename" @click="selectAvatar(v)">
                  <icon-font class="icon" type="icon-success" />
                </a-button>
                <a-button type="text" @click="this.confirm('确定删除该历史头像吗?', () => deleteAvatar(v))">
                  <icon-font class="icon" type="icon-ashbin" />
                </a-button>
              </p>
            </div>
          </a-space>
        </a-image-preview-group>

        <a-divider v-if="historyAvatar.values.length > 0" />

        <a-avatar :size="64" :src="this.principal.details.avatar" />
        <p class="margin-md-top">
          <a-upload :showUploadList="false" accept="image/png,image/jpeg,image/jpg,image/bmp" :action="'/api/resources/avatar/upload/' + this.principal.details.type + '/' + this.principal.details.id" @change="fileListChange" :before-upload="beforeUpload">
            <a-button size="small">
              <icon-font class="icon" type="icon-caps-lock" />
              <span class="hidden-xs hidden-sm hidden-md">上传头像</span>
            </a-button>
          </a-upload>
        </p>
        <a-typography-title class="margin-md-top" :level="4" type="default">{{ this.getPrincipalName(this.principal.details) }}</a-typography-title>
        <a-typography-title class="margin-md-top" :level="5" type="secondary" >所在组:{{ this.principal.details.roleAuthorities.map(r => r.name) }}</a-typography-title>

      </div>

      <a-tabs>

        <a-tab-pane key="update-password">

          <template #tab>
            <icon-font class="icon" type="icon-security" />
            <span class="hidden-xs hidden-sm hidden-md">修改密码</span>
          </template>

          <a-form ref="edit-form" :model="this.form" :rules="rules" layout="vertical">

            <a-form-item label="旧密码:" name="oldPassword">
              <a-input-password v-model:value="this.form.oldPassword" autocomplete="current-password"/>
            </a-form-item>

            <a-form-item label="新密码:" name="newPassword">
              <a-input-password v-model:value="this.form.newPassword" autocomplete="new-password"/>
            </a-form-item>

            <a-form-item label="确认密码:" name="confirmPassword">
              <a-input-password v-model:value="this.form.confirmPassword" autocomplete="new-password"/>
            </a-form-item>

            <a-divider />

            <a-space>
              <a-button type="primary" @click="submitForm()" :loading="spinning">
                <icon-font class="icon" type="icon-select" />
                <span class="hidden-xs hidden-sm hidden-md">保存</span>
              </a-button>
            </a-space>

          </a-form>
        </a-tab-pane>

      </a-tabs>

    </a-card>
  </div>
</template>

<script>

import {PRINCIPAL_MUTATION_TYPE} from "@/store/principal";

export default {
  name: "AuthenticationConsoleUserProfile",
  created() {
    this
        .$http
        .get("/api/resources/avatar/history/" + this.principal.details.type + "/" + this.principal.details.id)
        .then((r) => {
          this.historyAvatar = r.data.data;
          this.historyAvatar.values = this.historyAvatar.values || [];
        });
  },
  methods:{
    selectAvatar(name) {
      this
          .$http
          .post("/api/resources/avatar/select/" + this.principal.details.type + "/" + this.principal.details.id,this.formUrlEncoded({filename:name}))
          .then(r => {
            this.$store.commit(PRINCIPAL_MUTATION_TYPE.REFRESH_AVATAR);
            this.historyAvatar.currentAvatarFilename = name;
            this.$message.success(r.data.message);
          });
    },
    deleteAvatar(name) {
      this
          .$http
          .post("/api/resources/avatar/delete/" + this.principal.details.type + "/" + this.principal.details.id,this.formUrlEncoded({filename:name}))
          .then((r) => {
            this.historyAvatar.values.splice(this.historyAvatar.values.indexOf(name), 1);
            this.$message.success(r.data.message);
          });
    },
    beforeUpload(file) {
      let isTypeValid = file.type === 'image/jpeg' || file.type === 'image/png';

      if (!isTypeValid) {
        this.$message.error("仅支持上传 jpeg 或 png 的图片");
      }

      let isSizeValid = file.size / 1024 / 1024 < 1;

      if (!isSizeValid) {
        this.$message.error('图片必须小于 1MB!');
      }

      return isTypeValid && isSizeValid;
    },
    fileListChange(info) {
      if (info.file.status === "done") {
        this.$store.commit(PRINCIPAL_MUTATION_TYPE.REFRESH_AVATAR);
        let filename = info.file.response.data;
        if (!this.historyAvatar.values.includes(filename)) {
          this.historyAvatar.values.push(filename);
          this.historyAvatar.currentAvatarFilename = filename;
        }
      }
    },
    submitForm:function() {

      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        this
            .$http
            .post("/api/authentication/console/user/updatePassword",this.formUrlEncoded(this.form))
            .then((r) => {

              this.$message.success(r.data.message);
              this.$router.push({name:process.env.VUE_APP_LOGIN_PAGE.replace("/","")});
              this.spinning = false;

            })
            .catch(() => this.spinning = false);

      });
    },
    async validatePassword() {
      if (this.form.confirmPassword !== this.form.newPassword) {
        return Promise.reject('新密码与确认密码不一致');
      } else {
        return Promise.resolve();
      }
    }
  },
  data() {
    return {
      historyAvatar:{
        bucketName:"",
        historyFilename:"",
        currentAvatarFilename:"",
        values:[]
      },
      spinning:false,
      form: {
        oldPassword:"",
        newPassword:"",
        confirmPassword:""
      },
      rules:{
        oldPassword:[{ required: true, message: "请输旧密码", trigger: "change"}],
        newPassword: [
          { required: true, message: "请输新密码", trigger: "change"},
          {type:"string", pattern: /^(?!^[0-9a-z]+$)(?!^[0-9A-Z]+$)(?!^[0-9\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[a-zA-Z]+$)(?!^[a-z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)[a-z0-9A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$/, message:"密码段中在要求的四种(大写字母，小写字母，数字，标点符号)类型中至少存在三种"}
        ],
        confirmPassword: [
          { required: true, message: "请输入确认密码", trigger: "change" },
          { validator:this.validatePassword, trigger: "change"}
        ],
      }
    }
  }
}

</script>
