<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-survey" /> 审批管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-share" /> 我收到的</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="我收到的" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-share" />
      </template>

      <a-input v-model:value="this.form['filter_[name_like]']" @pressEnter="this.search(1)" placeholder="请输入表单名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" @click="this.search(1)">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
      </a-input>

      <a-table :loading="this.loading" class="ant-table-striped" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.page.elements" :columns="this.columns" bordered>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            {{record.status.name}}
          </template>
          <template v-if="column.dataIndex === 'username'">
            <a-space>
              <a-avatar :src="'/api/resources/avatar/get?filename=' + record.apply.userType + '/' + record.apply.userId + '/current&date=' + this.$dayjs().unix()" />
              {{record.apply.username}}
            </a-space>
          </template>
          <template v-if="column.dataIndex === 'creationTime'">
            {{ this.timestampFormat(record.creationTime) }}
          </template>
          <template v-if="column.dataIndex === 'urgentCount'">
            {{ record.apply.urgentCount }}
          </template>
          <template v-if="column.dataIndex === 'urgentTime'">
            {{ this.timestampFormat(record.apply.urgentTime) }}
          </template>
          <template v-if="column.dataIndex === 'completionTime'">
            {{ this.timestampFormat(record.apply.completionTime) }}
          </template>

          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-button size="small" type="primary" @click="detail(record)">
                <icon-font class="icon" type="icon-file" />
                <span class="hidden-xs hidden-sm hidden-md">详情</span>
              </a-button>
            </div>
          </template>
        </template>

      </a-table>

      <div class="margin-md-top text-right" >

        <a-space>
          <span class="hidden-xs hidden-sm hidden-md">每页</span>
          <a-input v-model:value="this.page.size" size="small" @pressEnter="search(1, $event)" :maxlength="4" class="text-center hidden-xs hidden-sm hidden-md" style="width: 50px" />
          <span class="hidden-xs hidden-sm hidden-md">条 / 第 {{this.page.number}} 页</span>
          <a-button size="small" @click="this.search(this.page.number - 1)" :disabled="this.page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
          <a-button size="small" @click="this.search(this.page.number + 1)" :disabled="this.page.last"><icon-font type="icon-arrow-right-bold" /></a-button>
        </a-space>

      </div>
    </a-card>
  </div>
</template>

<script>

export default {
  name:"WorkflowCopyMe",
  data() {
    return {
      columns:[
        {
          title: "申请人",
          dataIndex: "username",
          ellipsis: true,
          width: 200
        },{
          title: "创建时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 200
        },{
          title: "表单名称",
          dataIndex: "name",
          ellipsis: true,
          width: 150
        },{
          title: "状态",
          dataIndex: "status",
          ellipsis: true,
          width: 150
        },{
          title: "加急次数",
          dataIndex: "urgentCount",
          ellipsis: true,
          width: 150
        },{
          title: "最后加急时间",
          dataIndex: "urgentTime",
          ellipsis: true,
          width: 200
        },{
          title: "通过时间",
          dataIndex: "completionTime",
          ellipsis: true,
          width: 200
        },{
          title: "操作",
          align: "center",
          fixed: "right",
          key: "action",
          width: 110
        }
      ],
      form:{
        "filter_[name]":""
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      loading: false,
      statusOptions:[],
      genderOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.search();
  },
  methods:{
    detail(record) {

      let to = {
        name: "workflow_apply_detail"
      }

      if (record !== undefined) {
        to["query"] = {id:JSON.stringify([record.apply.id]), from:'workflow_work_copy_me'};
      }

      this.$router.push(to);

    },
    search(number) {

      this.loading = true;
      this.searchDialogVisible = false;

      let param = this.form;

      param.size = this.page.size || 10;
      param.number = number || this.page.number;

      this
          .$http
          .post("/api/workflow/work/copyMe",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>