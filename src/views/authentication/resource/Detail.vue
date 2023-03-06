<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-authority" /> 权限管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'authentication_resource'}"><icon-font class="icon" type="icon-attachment" /> 資源管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> {{ '[' + form.name + ']' + '資源明细' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="'[' + form.name + ']資源明细'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-file" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }">

          <a-descriptions-item label="名称"><icon-font class="icon" :type="!this.form.icon ? 'icon-unkown' : this.form.icon" /> {{this.form.name}} </a-descriptions-item>
          <a-descriptions-item label="所属应用">{{ this.form.applicationName }}</a-descriptions-item>
          <a-descriptions-item label="来源" :span="2">
            <a-space>
              <a-tag v-for="s of this.form.sources" :key="s.name" color="success">
                {{ s.name }}
              </a-tag>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="資源值" :span="2">{{ this.form.value ? this.form.value : ""}}</a-descriptions-item>
          <a-descriptions-item label="权限值">{{ this.form.authority ? this.form.authority : ""}}</a-descriptions-item>
          <a-descriptions-item label="类型">{{ this.form.type.value }}</a-descriptions-item>
          <a-descriptions-item label="版本号">{{ this.form.version }}</a-descriptions-item>
          <a-descriptions-item label="顺序值">{{ this.form.sort ? form.sort : "" }}</a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">{{ this.form.remark ? this.form.remark : "" }}</a-descriptions-item>

        </a-descriptions>
      </a-spin>

    </a-card>
  </div>
</template>

<script>

export default {
  name:"AuthenticationResourceDetail",
  data() {
    return {
      spinning:true,
      form: {
        name: "",
        value: "",
        authority: "",
        sources: [{
          name:"",
          value:""
        }],
        code:"",
        applicationName: "",
        type: {
          name:"",
          value:""
        },
        version: "",
        icon:"",
        sort:"",
        remark: "",
      }
    }
  },
  created() {

    this
        .$http
        .get("/api/authentication/resource/get?id=" + this.$route.query.id)
        .then(r => {
          this.form = r.data.data;
          this.spinning = false
        })
        .catch(() => this.spinning = false);

  }
}
</script>