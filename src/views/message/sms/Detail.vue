<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'message_sms'}"><icon-font class="icon" type="icon-notification" /> 短信消息</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 短信消息明细</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="短信消息明细" class="basic-box-shadow">
      <template #extra>
        <a-button @click="reload" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-refresh" />
          <span class="hidden-xs">刷新</span>
        </a-button>
      </template>

      <a-spin :spinning="spinning">
        <a-descriptions
            bordered
            :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }"
        >

          <a-descriptions-item label="类型">{{ form.type.name }}</a-descriptions-item>
          <a-descriptions-item label="状态"><a-badge :status="form.executeStatus.value === 0 ? 'processing' : form.executeStatus.value === 1 ? 'success' : 'error'" :text="form.executeStatus.name" /></a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ timestampFormat(form.creationTime) }} </a-descriptions-item>
          <a-descriptions-item label="下次重试时间">{{ timestampFormat(form.nextRetryTime) }} </a-descriptions-item>
          <a-descriptions-item label="最后发送时间">{{ timestampFormat(form.lastSendTime) }} </a-descriptions-item>
          <a-descriptions-item label="发送完成时间">{{ timestampFormat(form.successTime) }} </a-descriptions-item>
          <a-descriptions-item label="重试次数">{{ form.retryCount}}</a-descriptions-item>
          <a-descriptions-item label="最大重试次数">{{ form.maxRetryCount}}</a-descriptions-item>
          <a-descriptions-item label="异常信息" :span="2"><pre>{{ form.exception }}</pre></a-descriptions-item>

        </a-descriptions>

        <a-divider orientation="left">
          <a-typography-text type="secondary">
            <icon-font class="icon" type="icon-sms" />
            短信数据
          </a-typography-text>
        </a-divider>

        <a-descriptions bordered :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }">

          <a-descriptions-item label="发送渠道">{{ form.channel }}</a-descriptions-item>
          <a-descriptions-item label="收信号码">{{ form.phoneNumber }}</a-descriptions-item>
          <a-descriptions-item label="内容" :span="2"><p v-html="form.content"></p></a-descriptions-item>
        </a-descriptions>

      </a-spin>
    </a-card>
  </div>
</template>

<script>

export default {
  name:"MessageSmsDetail",
  methods:{
    reload(){

      this.spinning = true;

      this
          .$http
          .get("/api/message/sms/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;
            this.spinning = false
          })
          .catch(() => this.spinning = false);

    }
  },
  data() {
    return {
      spinning:true,
      form: {
        id:"",
        creationTime: "",
        type: {
          name:"",
          value:""
        },
        executeStatus:{
          name:"",
          value:""
        },
        lastSendTime: "",
        successTime:"",
        nextRetryTime:"",
        channel: "",
        phoneNumber: "",
        retryCount:"",
        maxRetryCount:"",
        exception:""
      }
    }
  },
  created() {
    this.reload();
  }
}
</script>