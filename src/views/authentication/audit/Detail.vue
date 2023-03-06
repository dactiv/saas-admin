<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'authentication_audit'}"><icon-font class="icon" type="icon-audit" /> 操作审计</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 审计详情</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="审计详情" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-file" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-descriptions bordered layout="vertical" class="margin-lg-bottom" :column="{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 1, xs: 1 }" title="基础细信息">

          <a-descriptions-item label="操作人">{{ this.form.principal}}  </a-descriptions-item>
          <a-descriptions-item label="真实姓名">
            <a-space>
              <a-avatar :src="'/api/resources/avatar/get?filename=' + this.form.principalType + '/' + this.form.principalId + '/current&date=' + this.$dayjs().unix()" />
              <span>{{ this.form.meta ? this.form.meta.realName || '' : ''}}  </span>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="操作模块">{{ this.form.type.substring(0, this.form.type.lastIndexOf(":"))}}</a-descriptions-item>
          <a-descriptions-item label="操作时间">{{ this.timestampFormat(this.form.timestamp.toString().replace(".","") * 1) }}</a-descriptions-item>
          <a-descriptions-item label="异常信息" :span="4">{{  this.form.data.exception || '无' }}</a-descriptions-item>

        </a-descriptions>

        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }" title="头信息" class="margin-lg-bottom">
          <a-descriptions-item v-for="(value, key) in this.form.data.header" :key="key" :label="key">{{value}}</a-descriptions-item>
        </a-descriptions>

        <a-descriptions v-if="this.form.data.body" bordered :column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }" title="请求体信息" class="margin-lg-bottom">
          <a-descriptions-item v-for="(value, key) in this.form.data.body" :key="key" :label="key">
            <pre>{{value}}</pre>
          </a-descriptions-item>
        </a-descriptions>

        <a-descriptions v-if="this.form.data.parameter" bordered :column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }" title="请求参数信息" class="margin-lg-bottom">
          <a-descriptions-item v-for="(value, key) in this.form.data.parameter" :key="key" :label="key">
            <pre>{{value}}</pre>
          </a-descriptions-item>
        </a-descriptions>

      </a-spin>

    </a-card>
  </div>
</template>

<script>

export default {
  name:"AuthenticationAuditDetail",
  data() {
    return {
      spinning:true,
      form: {
        principal: "",
        type: "",
        timestamp: "",
        data: ""
      }
    }
  },
  created() {


    let param = {
      id:this.$route.query.id,
      after: this.convertFormUrlencoded(this.$dayjs(this.$route.query.after * 1))
    };

    this
        .$http
        .get("/api/authentication/operational/audit/get?id=" + param.id + "&after=" + param.after)
        .then(r => {
          this.form = r.data.data;
          this.spinning = false
        })
        .catch(() => this.spinning = false);

  }
}
</script>