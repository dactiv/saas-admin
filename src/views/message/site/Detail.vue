<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'message_site'}"><icon-font class="icon" type="icon-notification" /> 站内信消息</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 站内信消息明细</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="站内信消息明细" class="basic-box-shadow">
      <template #extra>
        <a-button @click="reload" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-refresh" />
          <span class="hidden-xs hidden-sm hidden-md">刷新</span>
        </a-button>
      </template>

      <a-spin :spinning="this.spinning">
        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }">

          <a-descriptions-item label="类型">{{ form.type.name }}</a-descriptions-item>
          <a-descriptions-item label="状态"><a-badge :status="form.executeStatus.value === 0 ? 'processing' : form.executeStatus.value === 1 ? 'success' : 'error'" :text="form.executeStatus.name" /></a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ timestampFormat(form.creationTime) }} </a-descriptions-item>
          <a-descriptions-item label="下次重试时间">{{ timestampFormat(form.nextRetryTime) }} </a-descriptions-item>
          <a-descriptions-item label="最后发送时间">{{ timestampFormat(form.lastSendTime) }} </a-descriptions-item>
          <a-descriptions-item label="发送完成时间">{{ timestampFormat(form.successTime) }} </a-descriptions-item>
          <a-descriptions-item label="重试次数">{{ form.retryCount}}</a-descriptions-item>
          <a-descriptions-item label="最大重试次数">{{ form.maxRetryCount}}</a-descriptions-item>
          <a-descriptions-item label="异常信息" :span="2">
            <a-typography-paragraph :ellipsis="{ rows: 2, expandable: true, symbol: '查看更多' }" :content="form.exception" />
          </a-descriptions-item>

        </a-descriptions>

        <a-divider orientation="left">
          <a-typography-text type="secondary">
            <icon-font class="icon" type="icon-notification" />
            站内信数据
          </a-typography-text>
        </a-divider>

        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }">

          <a-descriptions-item label="发送渠道">{{ form.channel }}</a-descriptions-item>
          <a-descriptions-item label="推送 app">{{ form.isPushName}}</a-descriptions-item>
          <a-descriptions-item label="已读">{{form.isReadName}}</a-descriptions-item>
          <a-descriptions-item label="标题" :span="2">{{ form.title}}</a-descriptions-item>
          <a-descriptions-item label="内容" :span="2"><p v-html="form.content"></p></a-descriptions-item>
          <a-descriptions-item v-if="form.hasAttachment && form.hasAttachment.value > 0" label="附件" :span="2">

            <a-list class="attachment" item-layout="horizontal" bordered  :data-source="form.attachmentList">
              <template #renderItem="{ item }">
                <a-list-item :key="item.id">
                  <a-list-item-meta>
                    <template #title>
                      <a-typography-link href="javascript:;" @click="this.downloadFile(item.bucket, item.object)">
                        {{ item.name }}
                      </a-typography-link>
                    </template>
                    <template #avatar>
                      <a-typography-link href="javascript:;" @click="this.downloadFile(item.bucket, item.object)">
                        <icon-font class="icon" :type="getFileIcon(item.name)" />
                      </a-typography-link>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>

          </a-descriptions-item>
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
          .get("/api/message/site/get?id=" + this.$route.query.id)
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
        isPushName:"",
        isReadName:"",
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
        toUserId: "",
        retryCount:"",
        maxRetryCount:"",
        hasAttachment: 0,
        attachmentList:[],
        exception:""
      }
    }
  },
  created() {
    if (!this.$route.query.id) {
      this.$router.push({name:"400"});
      return ;
    }
    this.reload();
  }
}
</script>