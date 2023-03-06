<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'message_batch'}"><icon-font class="icon" type="icon-batch" /> 批量消息</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 批量消息明细</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="批量消息明细" class="basic-box-shadow">
      <template #extra>
        <a-button @click="reload(page.number)" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-refresh" />
          <span class="hidden-xs hidden-sm hidden-md">刷新</span>
        </a-button>
      </template>

      <a-spin :spinning="this.spinning">
        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }">

          <a-descriptions-item label="类型"><icon-font class="icon" :type="form.type.value === 10 ? 'icon-notification' : form.type.value === 20 ? 'icon-email' : 'icon-sms'" /> {{ form.type.name }}</a-descriptions-item>
          <a-descriptions-item label="状态"><a-badge :status="form.executeStatus.value === 0 ? 'processing' : form.executeStatus.value === 1 ? 'success' : 'error'" :text="form.executeStatus.name" /></a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ timestampFormat(form.creationTime) }} </a-descriptions-item>
          <a-descriptions-item label="完成时间">{{ timestampFormat(form.completeTime) }}</a-descriptions-item>
          <a-descriptions-item label="总发送数量">{{ form.count}}</a-descriptions-item>
          <a-descriptions-item label="发送中数量">{{ form.sendingNumber}}</a-descriptions-item>
          <a-descriptions-item label="发送成功数量"><a-typography-text type="success">{{ form.successNumber }}</a-typography-text></a-descriptions-item>
          <a-descriptions-item label="发送失败数量"><a-typography-text type="danger">{{ form.failNumber }}</a-typography-text></a-descriptions-item>

        </a-descriptions>

        <a-divider orientation="left"><a-typography-text type="secondary"><icon-font class="icon" :type="form.type.value === 10 ? 'icon-notification' : form.type.value === 20 ? 'icon-email' : 'icon-sms'" /> {{ form.type.name }}数据</a-typography-text></a-divider>

        <a-table class="ant-table-striped" :loading="this.loading" :rowKey="record=>record.id" :scroll="{ x: tableScrollX }" :pagination="false" :data-source="page.elements" :columns="columns" bordered>

          <template #bodyCell="{column, record}">
            <template v-if="column.dataIndex === 'type'">
              {{ record.type.name }}
            </template>
            <template v-if="column.dataIndex === 'pushable'">
              {{ record.pushable.name }}
            </template>
            <template v-if="column.dataIndex === 'executeStatus'">
              <template v-if="this.form.type.value === 10">
                <a-badge v-if="record.pushable.value === 10" :status="this.executeStatus[record.executeStatus.value]" :text="record.executeStatus.name" />
                <template v-else>
                  无需推送
                </template>
              </template>
              <a-badge v-else :status="this.executeStatus[record.executeStatus.value]" :text="record.executeStatus.name" />
            </template>
            <template v-if="column.dataIndex === 'lastSendTime'">
              {{ timestampFormat(record.lastSendTime) }}
            </template>
            <template v-if="column.dataIndex === 'username'">
              <a-space>
                <a-avatar :src="'/api/resources/avatar/get?filename=' + record.userType + '/' + record.userId + '/current&date=' + this.$dayjs().unix()" />
                {{record.username}}
              </a-space>
            </template>
            <template v-if="column.dataIndex === 'successTime'">
              {{ timestampFormat(record.successTime) }}
            </template>
          </template>

        </a-table>

        <div class="margin-md-top text-right" >

          <a-space>
            <span class="hidden-xs hidden-sm hidden-md">每页</span>
            <a-input v-model:value="page.size" size="small" @pressEnter="search(1,$event)" :maxlength="4" class="text-center hidden-xs hidden-sm hidden-md" style="width: 50px" />
            <span class="hidden-xs hidden-sm hidden-md">条 / 第 {{page.number}} 页</span>
            <a-button size="small" @click="search(page.number - 1)" :disabled="page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
            <a-button size="small" @click="search(page.number + 1)" :disabled="page.last"><icon-font type="icon-arrow-right-bold" /></a-button>

          </a-space>

        </div>

      </a-spin>
    </a-card>
  </div>
</template>

<script>

export default {
  name:"MessageBatchDetail",
  methods:{
    search(number) {

      if (this.form.type.value === 10) {
        this.loadSiteData(number);
      } else if (this.form.type.value === 20) {
        this.loadEmailData(number);
      } else if (this.form.type.value === 30) {
        this.loadSmsData(number);
      }

    },
    reload(){

      if (!this.$route.query.id) {
        return
      }

      this
          .$http
          .get("/api/message/batch/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;
            if (this.form.type.value === 10) {
              this.loadSiteData();
            } else if (this.form.type.value === 20) {
              this.loadEmailData();
            } else if (this.form.type.value === 30) {
              this.loadSmsData();
            }
            this.spinning = false
          })
          .catch(() => this.spinning = false);
    },
    loadBatchData() {

      if (!this.$route.query.id) {
        return
      }

      this
          .$http
          .get("/api/message/batch/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;
            this.reload();
            this.spinning = false
          })
          .catch(() => this.spinning = false);
    },
    loadSmsData(number) {
      this.loading = true;
      let param = {"filter_[batch_id_eq]":this.form.id};

      param.size = this.page.size || 10;
      param.number = number || this.page.number;

      this
          .$http
          .post("/api/message/sms/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.columns = this.smsColumns;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    },
    loadSiteData(number) {
      this.loading = true;
      let param = {"filter_[batch_id_eq]":this.form.id};

      param.size = this.page.size || 10;
      param.number = number || this.page.number;

      this
          .$http
          .post("/api/message/site/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.columns = this.siteColumns;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    },
    loadEmailData(number) {
      this.loading = true;
      let param = {"filter_[batch_id_eq]":this.form.id};

      param.size = this.page.size || 10;
      param.number = number || this.page.number;

      this
          .$http
          .post("/api/message/email/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.columns = this.emailColumns;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  },
  computed: {
    tableScrollX() {

      if (this.columns.length > 0) {
        return this.columns.filter(c => c.width).reduce((sum, c) =>sum + c.width, 0);
      }

      return 0;
    }
  },
  data() {
    return {
      page:{
        elements:[],
        first:false,
        last:false,
        number:1
      },
      loading:false,
      columns:[{
        title: "临时表格",
        ellipsis: true,
        width: 80
      }],
      executeStatus:{
        "0":"processing",
        "1":"success",
        "2":"warning",
        "99":"error"
      },
      smsColumns:[
        {
          title: "状态",
          dataIndex: "executeStatus",
          ellipsis: true,
          width: 150
        },
        {
          title: "类型",
          dataIndex: "type",
          ellipsis: true,
          width: 100
        },
        {
          title: "发送渠道",
          dataIndex: "channel",
          ellipsis: true,
          width: 200
        },
        {
          title: "收信电话",
          dataIndex: "phoneNumber",
          ellipsis: true,
          width: 200
        },{
          title: "内容",
          dataIndex: "content",
          ellipsis: true,
          width: 250
        },{
          title: "重试次数",
          dataIndex: "retryCount",
          ellipsis: true,
          width: 150
        },{
          title: "最后发送时间",
          dataIndex: "lastSendTime",
          ellipsis: true,
          width: 200
        },{
          title: "发送成功时间",
          dataIndex: "successTime",
          ellipsis: true,
          width: 200
        }
      ],
      siteColumns:[
        {
          title: "类型",
          dataIndex: "type",
          ellipsis: true,
          width: 100
        },
        {
          title: "推送 app",
          dataIndex: "pushable",
          ellipsis: true,
          width: 100
        },
        {
          title: "推送消息状态",
          dataIndex: "executeStatus",
          ellipsis: true,
          width: 150
        },
        {
          title: "发送渠道",
          dataIndex: "channel",
          ellipsis: true,
          width: 200
        },
        {
          title: "收信用户",
          dataIndex: "username",
          ellipsis: true,
          width: 200
        },{
          title: "标题",
          dataIndex: "title",
          ellipsis: true,
          width: 250
        },{
          title: "重试次数",
          dataIndex: "retryCount",
          ellipsis: true,
          width: 150
        },{
          title: "最后发送时间",
          dataIndex: "lastSendTime",
          ellipsis: true,
          width: 200
        },{
          title: "发送成功时间",
          dataIndex: "successTime",
          ellipsis: true,
          width: 200
        }
      ],
      emailColumns:[
        {
          title: "状态",
          dataIndex: "executeStatus",
          ellipsis: true,
          width: 150
        },
        {
          title: "类型",
          dataIndex: "type",
          ellipsis: true,
          width: 100
        },
        {
          title: "发送邮件",
          dataIndex: "fromEmail",
          ellipsis: true,
          width: 200
        },
        {
          title: "收取邮件",
          dataIndex: "toEmail",
          ellipsis: true,
          width: 200
        },{
          title: "标题",
          dataIndex: "title",
          ellipsis: true,
          width: 300
        },{
          title: "重试次数",
          dataIndex: "retryCount",
          ellipsis: true,
          width: 150
        },{
          title: "最后发送时间",
          dataIndex: "lastSendTime",
          ellipsis: true,
          width: 200
        },{
          title: "发送成功时间",
          dataIndex: "successTime",
          ellipsis: true,
          width: 200
        }
      ],
      spinning:true,
      form: {
        id:"",
        creationTime: "",
        type:"",
        executeStatus:"",
        successNumber: "",
        failNumber:"",
        sendingNumber: "",
        completeTime: ""
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