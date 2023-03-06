<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'message_comment'}"><icon-font class="icon" type="icon-comment" /> 评论消息</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 评价明细</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="评论明细" class="basic-box-shadow">
      <template #extra>
        <a-button @click="reload" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-refresh" />
          <span class="hidden-xs hidden-sm hidden-md">刷新</span>
        </a-button>
      </template>

      <a-spin :spinning="this.spinning">
        <a-descriptions bordered layout="vertical" :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }">

          <a-descriptions-item label="目标类型">{{ this.form.targetType.name }}</a-descriptions-item>
          <a-descriptions-item label="目标名称">{{ this.form.targetName }}</a-descriptions-item>
          <a-descriptions-item label="评价用户" >
            <a-space>
              <a-avatar :src="'/api/resources/avatar/get?filename=' + this.form.userType + '/' + this.form.userId + '/current&date=' + this.$dayjs().unix()" />
              {{this.form.username}}
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="评价时间">{{ timestampFormat(this.form.creationTime) }} </a-descriptions-item>
          <a-descriptions-item label="是否匿名" :span="2">{{ this.form.anonymous.name }} </a-descriptions-item>
          <a-descriptions-item label="评价内容" :span="2"><div v-html="this.form.content"></div> </a-descriptions-item>

        </a-descriptions>

      </a-spin>
    </a-card>
  </div>
</template>

<script>

export default {
  name:"MessageEvaluateDetail",
  methods:{
    reload() {

      this.spinning = true;

      this
          .$http
          .get("/api/message/comment/get?id=" + this.$route.query.id)
          .then(r => {
            r.data.data.append = r.data.data.append || [];
            this.form = r.data.data;
            this.spinning = false
          })
          .catch(() => this.spinning = false);

    }
  },
  data() {
    return {
      spinning:true,
      columns:[
        {
          title: "创建时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 200
        },
        {
          title: "更新时间",
          dataIndex: "updateTime",
          ellipsis: true,
          width: 200
        },
        {
          title: "内容",
          dataIndex: "content",
          ellipsis: true,
        },
        {
          title: "操作",
          align: "center",
          key:"action",
          fixed: "right",
          width: 110,
        }
      ],
      form: {
        id:undefined,
        targetName:"",
        targetType: {
          name:"",
          value:0
        },
        anonymous:{
          name:"",
          value:0
        },
        rate:0.00,
        content:"",
        append:""
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