<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'authentication_info'}"><icon-font class="icon" type="icon-sign-out" /> 用户登陆信息</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 登陆信息详情</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="登陆信息详情" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-file" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }" title="基础信息" class="margin-lg-bottom">
          <a-descriptions-item label="登陆账号">{{ this.form.username}} </a-descriptions-item>
          <a-descriptions-item label="登陆类型">{{ this.getUserTypeName(this.form.userType) }}</a-descriptions-item>
          <a-descriptions-item label="登陆时间">{{ this.timestampFormat(form.creationTime) }}</a-descriptions-item>
          <a-descriptions-item label="登陆 IP">{{ this.form.ipRegion.ipAddress + ' ' + (this.form.ipRegion.country || '') + ' ' + (this.form.ipRegion.province || '') + ' ' + (this.form.ipRegion.city || '') + ' ' + (this.form.ipRegion.district || '')}} </a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">{{ this.form.remark}} </a-descriptions-item>
        </a-descriptions>

        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }" title="元数据信息" class="margin-lg-bottom">
          <a-descriptions-item v-for="(value, key) in this.form.meta" :key="key" :label="key">{{value}}</a-descriptions-item>
        </a-descriptions>

        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }" title="设备信息" class="margin-lg-bottom">
          <a-descriptions-item v-for="(value, key) in this.form.device" :key="key" :label="key">{{value}}</a-descriptions-item>
        </a-descriptions>
      </a-spin>

    </a-card>
  </div>
</template>

<script>

export default {
  name:"AuthenticationInfoDetail",
  data() {
    return {
      spinning:true,
      sourceOptions:[],
      form: {
        id:"",
        creationTime:"",
        username: "",
        meta: "",
        userType: "",
        ipRegion: "",
        device:"",
        syncStatus:"",
        retryCount:"",
        remark:""
      }
    }
  },
  methods:{
    getUserTypeName(userType) {
      for (let key in this.sourceOptions) {
        if (this.sourceOptions[key] === userType) {
          return key
        }
      }
      return userType;
    },
  },
  created() {

    let param = {
      id:this.$route.query.id
    };

    this.loadConfigEnumerate({service:"config",enumerateName:"ResourceSourceEnum"}).then(r => this.sourceOptions = r.data.data);

    this
        .$http
        .get("/api/authentication/authentication/info/get?id=" + param.id)
        .then(r => {
          this.form = r.data.data;
          this.spinning = false
        })
        .catch(() => this.spinning = false);

  }
}
</script>