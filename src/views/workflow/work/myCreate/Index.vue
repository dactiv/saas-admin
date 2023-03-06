<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-survey" /> 审批管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-history" /> 我创建的</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="我创建的申请" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-history" />
      </template>

      <a-input v-model:value="this.form['filter_[form_name_like]']" @pressEnter="this.search(1)" placeholder="请输入表单名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" @click="this.search(1)">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-dropdown placement="bottomLeft">
            <a-button size="small" type="text" >
              <icon-font class="icon" type="icon-setting"/>
              操作
            </a-button>
            <template #overlay>
              <a-menu @click="handleMenuClick" >
                <a-menu-item key="delete" :disabled="this.selectedRecords.filter(s => s.status.value === 10).length <= 0 || !this.principal.hasPermission('perms[apply:delete]')">
                  <a-space>
                    <icon-font class="icon" type="icon-ashbin" />
                    删除选中({{this.selectedRecords.filter(s => s.status.value === 10).length}})
                  </a-space>
                </a-menu-item>
                <a-menu-item key="publish" :disabled="this.selectedRecords.filter(s => s.status.value === 10).length <= 0 || !this.principal.hasPermission('perms[apply:publish]')">
                  <a-space>
                    <icon-font class="icon" type="icon-complete" />
                    提交选中({{this.selectedRecords.filter(s => s.status.value === 10).length}})
                  </a-space>
                </a-menu-item>
                <a-menu-item key="cancel" :disabled="this.selectedRecords.filter(s => s.status.value === 20).length <= 0 || !this.principal.hasPermission('perms[apply:cancel]')">
                  <a-space>
                    <icon-font class="icon" type="icon-complete" />
                    撤销选中({{this.selectedRecords.filter(s => s.status.value === 20).length}})
                  </a-space>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

        </template>
      </a-input>

      <a-table :loading="this.loading" class="ant-table-striped" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :row-selection="{ selectedRowKeys: this.selectedRecords.map(r => r.id), onChange:this.selectChange}" :pagination="false" :data-source="this.page.elements" :columns="this.columns" bordered>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            {{record.status.name}}
          </template>
          <template v-if="column.dataIndex === 'approvalType'">
            {{record.approvalType.name}}
          </template>
          <template v-if="column.dataIndex === 'creationTime'">
            {{ this.timestampFormat(record.creationTime) }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-dropdown size="small" type="text" placement="bottomRight">
                <template #overlay>
                  <a-menu @click="handleMenuClick($event, record)" >
                    <a-menu-item key="publish" :disabled="record.status.value !== 10 || !this.principal.hasPermission('perms[apply:publish]')">
                      <a-space>
                        <icon-font class="icon" type="icon-complete" />
                        提交
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="detail" :disabled="!this.principal.hasPermission('perms[apply:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-file" />
                        详情
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="edit" :disabled="[20, 30, 40, 50].includes(record.status.value) ||  !this.principal.hasPermission('perms[apply:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-edit" />
                        编辑
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete" :disabled="![10, 50].includes(record.status.value) ||  !this.principal.hasPermission('perms[apply:delete]')">
                      <a-space>
                        <icon-font class="icon" type="icon-ashbin" />
                        删除
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="cancel" :disabled="[10, 30, 40, 50].includes(record.status.value) ||  !this.principal.hasPermission('perms[apply:cancel]')">
                      <a-space>
                        <icon-font class="icon" type="icon-back" />
                        撤销
                      </a-space>
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button size="small" >
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
  name:"WorkflowApply",
  data() {
    return {
      columns:[
        {
          title: "创建时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 200
        },{
          title: "表单名称",
          dataIndex: "formName",
          ellipsis: true,
          width: 150
        },{
          title: "状态",
          dataIndex: "status",
          ellipsis: true,
          width: 150
        },{
          title: "操作",
          align: "center",
          fixed: "right",
          key: "action",
          width: 110
        }
      ],
      selectedRecords:[],
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
    selectChange(selectedKeys, selectRecords) {
      this.selectedRecords = selectRecords;
    },
    handleMenuClick(e, record) {
      if (e.key === "delete") {
        if (record) {
          this.confirm("确定要删除 [" + record.formName + "] 申请吗吗?", () => this.remove([record.id]));
        } else {
          let ids = this.selectedRecords.filter(s => s.status.value === 10).map(s => s.id);
          this.confirm("确定要删除 " + ids.length + " 条记录吗?", () => this.remove(ids));
        }
      } else if (e.key === "publish") {
        if (record) {
          this.confirm("确定要提交 [" + record.formName + "] 申请吗吗?", () => this.publish([record.id]));
        } else {
          let ids = this.selectedRecords.filter(s => s.status.value === 10).map(s => s.id);
          this.confirm("确定要提交 " + ids.length + " 条记录吗?", () => this.publish(ids));
        }
      }else if (e.key === "cancel") {
        if (record) {
          this.confirm("确定要撤销 [" + record.formName + "] 申请吗吗?", () => this.cancel([record.id]));
        } else {
          let ids = this.selectedRecords.filter(s => s.status.value === 20).map(s => s.id);
          this.confirm("确定要撤销 " + ids.length + " 条记录吗?", () => this.cancel(ids));
        }
      } else if (e.key === "detail") {
        let to = {
          name: "workflow_apply_detail"
        }

        if (record !== undefined) {
          to["query"] = {id:JSON.stringify([record.id]), from:'workflow_work_my_create'};
        }

        this.$router.push(to);
      }
    },
    publish(ids) {
      this.loading = true;
      this
          .$http
          .post("/api/workflow/apply/publish",this.formUrlEncoded({ids}))
          .then((r) => {
            this.$message.success(r.data.message);
            this.$router.push({name: "workflow_work_my_submit"});
          })
          .catch(() => this.loading = false);
    },
    cancel(ids) {
      this.loading = true;
      this
          .$http
          .post("/api/workflow/apply/cancel",this.formUrlEncoded({ids}))
          .then((r) => {
            this.$message.success(r.data.message);
            this.search();
          })
          .catch(() => this.loading = false);
    },
    remove(ids) {
      this.loading = true;
      this
          .$http
          .post("/api/workflow/apply/delete",this.formUrlEncoded({ids}))
          .then((r) => {
            this.$message.success(r.data.message);
            this.search(1);
          })
          .catch(() => this.loading = false);
    },
    edit(record) {
      let to = {
        name: "workflow_form_apply"
      }

      if (record !== undefined) {
        to["query"] = {formId:record.formId, applyId: record.id};
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
          .post("/api/workflow/apply/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>