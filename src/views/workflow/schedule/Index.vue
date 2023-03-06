<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-survey" /> 审批管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-date-range" /> 日程管理</a-breadcrumb-item>

    </a-breadcrumb>

    <a-card title="日程" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-date-range" />
      </template>

      <a-input v-model:value="this.form['filter_[name_like]']" @pressEnter="this.search(1)" placeholder="请输入日程名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" :loading="this.loading" @click="this.search(1)">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-dropdown size="small" type="text" placement="bottomLeft">
            <template #overlay>
              <a-menu @click="handleMenuClick" >
                <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[curriculum_notice:save]')">
                  <a-space>
                    <icon-font class="icon" type="icon-add" />
                    添加
                  </a-space>
                </a-menu-item>
                <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[curriculum_notice:delete]')">
                  <a-space>
                    <icon-font class="icon" type="icon-ashbin" />
                    删除选中({{this.selectedIds.length}})
                  </a-space>
                </a-menu-item>
              </a-menu>
            </template>
            <a-button size="small" type="text">
              <icon-font class="icon" type="icon-setting"/>
              操作
            </a-button>
          </a-dropdown>
        </template>
      </a-input>

      <a-table :loading="this.loading" class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange:this.selectChange }" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.page.elements" :columns="this.columns" bordered>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'username'">
            <a-space>
              <a-avatar :src="'/api/resources/avatar/get?filename=' + record.userType + '/' + record.userId + '/current&date=' + this.$dayjs().unix()" />
              {{record.username}}
            </a-space>
          </template>
          <template v-if="column.dataIndex === 'creationTime'">
            {{ this.timestampFormat(record.creationTime) }}
          </template>
          <template v-if="column.dataIndex === 'publishTime'">
            {{ this.timestampFormat(record.publishTime) }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            {{ record.status.name }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-dropdown size="small" type="text" placement="bottomLeft">
                <template #overlay>
                  <a-menu @click="handleMenuClick($event, record)" >
                    <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[schedule:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-file" />
                        详情
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[schedule:delete]')">
                      <a-space>
                        <icon-font class="icon" type="icon-ashbin" />
                        删除
                      </a-space>
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button size="small">
                  <icon-font class="icon" type="icon-setting"/>
                  操作
                </a-button>
              </a-dropdown>
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
  name:"WorkflowScheduleIndex",
  data() {
    return {
      columns:[
        {
          title: "创建人",
          dataIndex: "username",
          ellipsis: true,
          width: 200
        },
        {
          title: "创建时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 200
        },
        {
          title: "日程名称",
          dataIndex: "name",
          ellipsis: true,
          width: 350
        },
        {
          title: "状态",
          dataIndex: "status",
          ellipsis: true,
          width: 110
        },
        {
          title: "发布时间",
          dataIndex: "publishTime",
          ellipsis: true,
          width: 200
        },
        {
          title: "操作",
          align: "center",
          fixed: "right",
          key: "action",
          width: 110
        }
      ],

      selectedIds:[],
      form:{
        "filter_[name_like]":""
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      loading: false,
      searchDialogVisible: false
    }
  },
  created() {
    this.search();
  },
  methods:{
    handleMenuClick(e, record) {
      if (e.key === "edit") {
        this.edit(record);
      } else if (e.key === "delete") {
        if (record) {
          this.confirm("确定要删除 [" + record.realName + "] 日程吗?", () => this.remove([record.id]));
        } else {
          this.confirm("确定要删除 " + this.selectedIds.length + " 条记录吗?", () => this.remove(this.selectedIds));
        }
      }
    },
    edit(record) {

      let to = {
        name: "workflow_schedule_details"
      }

      if (record !== undefined) {
        to.query = {id:record.id};
      }

      this.$router.push(to);

    },
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    remove(ids) {

      this.loading = true;
      this
          .$http
          .post("/api/workflow/schedule/delete",this.formUrlEncoded({ids:ids})).then((r) => {
            this.$message.success(r.data.message);
            this.selectedIds = [];
            this.search();
          })
          .catch(() => this.loading = false);

    },
    search(number) {

      this.loading = true;
      this.searchDialogVisible = false;

      let param = this.form;

      param.size = this.page.size || 10;
      param.number = number || this.page.number;

      this
          .$http
          .post("/api/workflow/schedule/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>