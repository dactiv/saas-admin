<template>
  <div class="height-100-percent">
    <a-row type="flex" justify="center" align="middle" style="height: calc(100vh - 46px);min-height: 800px;">
      <a-col :span="24">
        <div class="authentication">
          <a-card class="basic-box-shadow">
            <a-spin :spinning="spinning" tip="正在登陆，请稍等片刻。。。">

              <p class="text-center">
                <img src="@/assets/logo.png" :style="{width: '85px', height:'85px'}"/>
              </p>

              <h3 class="text-center">
                <span> 新优学信息科技有限公司 </span>
              </h3>

              <a-form ref="login-form" :model="this.form" :rules="rules" layout="vertical">
                <a-form-item label="登陆账户:" name="username" autoComplete="username">
                  <a-input v-model:value="this.form.username" />
                </a-form-item>
                <a-form-item label="登陆密码:" name="password" autoComplete="password">
                  <a-input-password v-model:value="this.form.password"/>
                </a-form-item>
                <a-form-item label="登陆角色:">
                  <a-select ref="select" v-model:value="this.form.role">
                    <a-select-option value="CONSOLE">后台管理员</a-select-option>
                    <a-select-option value="TEACHER">教师</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="验证码:" name="captcha" class="picture-captcha" v-if="captcha.data.type === 'picture'">
                  <a-input v-model:value="this.form.captcha">
                    <template #addonAfter>
                      <a-space size="0">
                      <a-image :width="100" :height="30" :src="captcha.pictureCaptchaUrl"/>
                      <a-button type="text" size="small" @click="generatePictureCaptcha">
                        <icon-font v-if="!spinning" type="icon-refresh" />
                      </a-button>
                      </a-space>
                    </template>
                  </a-input>
                </a-form-item>
                <a-form-item>
                  <a-checkbox v-model:checked="this.form.rememberMe"> 一周内记住我 </a-checkbox>
                </a-form-item>

                <a-button type="primary" block @click="submitForm('login-form')" :loading="spinning">
                  <icon-font v-if="!spinning" type="icon-security" /> 登录
                </a-button>

                <a-divider class="logo"><icon-font class="icon" type="icon-vue" /></a-divider>

              </a-form>
            </a-spin>
          </a-card>
        </div>

      </a-col>
    </a-row>

    <a-row>
      <a-col :span="24">
        <p class="text-center margin">
          COPYRIGHT © 2022 新优学信息科技有限公司, All rights ReservedHand-crafted & Made with {{ this.version }}
        </p>
      </a-col>
    </a-row>
  </div>
</template>

<script>

import {PRINCIPAL_ACTION_TYPE} from "@/store/principal"

export default {
  name:"Login",
  data() {
    return {
      spinning:false,
      captcha: {
        generateMapping:{
          picture:this.generatePictureCaptcha
        },
        submitFormMapping: {
          picture:this.getPictureCaptchaField
        },
        data:{},
        pictureCaptchaUrl:"",
        submit:false
      },
      form: {
        username: "",
        password: "",
        role: "CONSOLE",
        rememberMe: true,
        type: "Username",
        deviceIdentified:"",
        captcha:""
      },
      rules: {
        username: [{ required: true, message: "请输入登陆账户", trigger: "blur" }],
        password: [{ required: true, message: "请输入登陆密码", trigger: "blur" }],
        captcha: [{ required: true, message: "请输入验证码", trigger: "blur" }]
      }
    }
  },
  created() {
    this.$http.get("/api/authentication/prepare").then(this.prepare);
  },
  methods: {
    prepare(r) {

      this.spinning = false;

      if (r.data.executeCode === process.env.VUE_APP_ERROR_CAPTCH_CODE) {
        this.captcha.submit = true;
        this.captcha.data = r.data.data;

        this.captcha.generateMapping[this.captcha.data.type]();
      }

      this.form.deviceIdentified = this.saveDeviceIdentified(r);
    },
    getPictureCaptchaField() {
      this.form["_pictureCaptcha"] = this.form.captcha;
      this.form[this.captcha.data.paramName] = this.captcha.data.token.name;
    },
    generatePictureCaptcha() {
      this.captcha.pictureCaptchaUrl = "/api/captcha/generateCaptcha?" + this.captcha.data.paramName + "=" + this.captcha.data.token.name + "&height=30&time=" + new Date().getTime();
    },
    submitForm(form) {
      this.$refs[form].validate().then(() => {

        if (this.captcha.submit) {
          this.captcha.submitFormMapping[this.captcha.data.type]();
        }

        this.spinning = true;

        let data = {data : this.formUrlEncoded(this.form), role: this.form.role};

        this
            .$store
            .dispatch(PRINCIPAL_ACTION_TYPE.LOGIN, data)
            .then(() => this.$router.push("/"))
            .catch((r) => {
              this.prepare(r);
              this.spinning = false;
            });

      });
    }
  }
}
</script>