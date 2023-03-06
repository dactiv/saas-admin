<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'message_evaluate'}"><icon-font class="icon" type="icon-excellent" /> 评价消息</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 评价明细</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="评价明细" class="basic-box-shadow">
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
          <a-descriptions-item label="是否匿名">{{ this.form.anonymous.name }} </a-descriptions-item>
          <a-descriptions-item label="评价星级"><a-rate v-model:value="this.form.rate" disabled allow-half /></a-descriptions-item>
          <a-descriptions-item label="评价内容" :span="2"><div v-html="this.form.content"></div> </a-descriptions-item>

          <a-descriptions-item label="追加评价" :span="2">
            <a-table :loading="this.spinning" class="ant-table-striped" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.form.append" :columns="this.columns" bordered>
              <template #bodyCell="{column, record}">
                <template v-if="column.dataIndex === 'creationTime'">
                  {{ timestampFormat(record.creationTime) }}
                </template>
                <template v-if="column.dataIndex === 'updateTime'">
                  {{ timestampFormat(record.updateTime) }}
                </template>
                <template v-if="column.key === 'action'">
                  <div class="text-center">
                    <a-button danger size="small" type="primary" @click="this.confirm('确定删除该信息吗?', this.deleteAppend(record))">
                      <icon-font class="icon" type="icon-ashbin" />
                      <span class="hidden-xs hidden-sm hidden-md">删除</span>
                    </a-button>
                  </div>
                </template>
              </template>
            </a-table>
          </a-descriptions-item>

        </a-descriptions>

      </a-spin>
    </a-card>
  </div>
</template>

<script>

export default {
  name:"MessageEvaluateDetail",
  methods:{
    deleteAppend(record) {
      this.spinning = true;

      this
          .$http
          .post("/api/message/evaluate/deleteAppend",this.formUrlEncoded({id:this.form.id, appendId:record.id}))
          .then(r => {
            this.$message.success(r.data.message);
            this.spinning = false
          })
          .catch(() => this.spinning = false);
    },
    reload() {

      this.spinning = true;

      this
          .$http
          .get("/api/message/evaluate/get?id=" + this.$route.query.id)
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