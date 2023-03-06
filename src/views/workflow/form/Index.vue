<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-survey" /> 审批管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-form" /> 流程表单管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-layout>
      <a-layout-sider class="basic-box-shadow" theme="light" width="430">
        <a-card size="small" :bordered="false" title="表单分组" :bodyStyle="{padding:0}">
          <template #extra>
            <icon-font class="icon" type="icon-group" />
          </template>

          <div class="padding border-split-bottom">
            <a-input v-model:value="this.group.form['filter_[name_like]']" placeholder="请输入分组名称进行查询">
              <template #addonBefore>
                <a-dropdown size="small" type="text" placement="bottomLeft">
                  <template #overlay>
                    <a-menu @click="handleGroupMenuClick" >
                      <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[form_group:save]')">
                        <a-space>
                          <icon-font class="icon" type="icon-add" />
                          添加
                        </a-space>
                      </a-menu-item>
                      <a-menu-item key="delete" :disabled="this.group.selectedIds.length <= 0 || !this.principal.hasPermission('perms[form_group:delete]')">
                        <a-space>
                          <icon-font class="icon" type="icon-ashbin" />
                          作废选中({{this.group.selectedIds.length}})
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
          </div>

          <a-table :loading="this.group.loading.table" :rowKey="record=>record.id" :scroll="{ x: this.group.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.group.dataSource" :row-selection="{ selectedRowKeys: this.group.selectedIds, onChange:groupSelectChange}" :columns="this.group.columns">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'name'">
                <template v-if="record.remark">
                  <a-tooltip :title="record.remark">
                    <a-typography-text type="warning">
                      <icon-font class="icon" type="icon-help"/>
                    </a-typography-text>
                  </a-tooltip>
                  {{record.name}}
                </template>
                <template v-else>
                  {{record.name}}
                </template>
              </template>
              <template v-if="column.key === 'action'">
                <div class="text-center">
                  <a-dropdown size="small" type="text" placement="bottomRight">
                    <template #overlay>
                      <a-menu @click="handleGroupMenuClick($event, record)" >
                        <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[form_group:get]')">
                          <a-space>
                            <icon-font class="icon" type="icon-edit" />
                            编辑
                          </a-space>
                        </a-menu-item>
                        <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[form_group:delete]')">
                          <a-space>
                            <icon-font class="icon" type="icon-ashbin" />
                            删除
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
        </a-card>
      </a-layout-sider>
      <a-layout >
        <a-layout-content class="margin-lg-left">
          <a-card size="small" title="流程表单管理" class="basic-box-shadow">

            <template #extra>
              <icon-font class="icon" type="icon-form" />
            </template>

            <a-input v-model:value="this.form.searchData['filter_[name_like]']" @pressEnter="this.searchForm(1)" placeholder="请输入表单进行查询" class="margin-bottom">
              <template #addonAfter>
                <a-dropdown-button type="text" size="small" :loading="this.form.loading" @click="this.searchForm(1)">
                  <icon-font class="icon" v-if="!this.form.loading" type="icon-search" />
                  <span class="hidden-xs hidden-sm hidden-md">搜索</span>
                  <template #overlay>
                    <a-menu @click="this.form.searchDialogVisible = true;">
                      <a-menu-item key="searchModel">
                        <icon-font class="icon" type="icon-filter" />
                        <span class="hidden-xs hidden-sm hidden-md">
                          高级搜索
                        </span>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown-button>
              </template>
              <template #addonBefore>
                <a-dropdown size="small" type="text" placement="bottomLeft">
                  <template #overlay>
                    <a-menu @click="handleFormMenuClick" >
                      <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[form:save]')">
                        <a-space>
                          <icon-font class="icon" type="icon-add" />
                          添加
                        </a-space>
                      </a-menu-item>
                      <a-menu-item key="delete" :disabled="this.form.selectedIds.length <= 0 || !this.principal.hasPermission('perms[form:delete]')">
                        <a-space>
                          <icon-font class="icon" type="icon-ashbin" />
                          删除选中({{this.form.selectedIds.length}})
                        </a-space>
                      </a-menu-item>
                      <a-menu-item key="recovery" :disabled="this.form.recoverIds.length <= 0 || !this.principal.hasPermission('perms[form:recovery]')">
                        <a-space>
                          <icon-font class="icon" type="icon-forward" />
                          恢复选中({{this.form.recoverIds.length}})
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

            <a-table :loading="this.form.loading" class="ant-table-striped" :row-selection="{ selectedRowKeys: this.form.selectedIds, onChange:formSelectChange }" :rowKey="record=>record.id" :scroll="{ x: this.form.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.form.page.elements" :columns="this.form.columns" bordered>

              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'approvalType'">
                  {{record.approvalType.name}}
                </template>
                <template v-if="column.dataIndex === 'status'">
                  {{record.status.name}}
                </template>
                <template v-if="column.key === 'action'">
                  <div class="text-center">
                    <a-dropdown size="small" type="text" placement="bottomRight">
                      <template #overlay>
                        <a-menu @click="handleFormMenuClick($event, record)" >
                          <a-menu-item key="edit" :disabled="record.status.value === 30 || !this.principal.hasPermission('perms[form:get]')">
                            <a-space>
                              <icon-font class="icon" type="icon-edit" />
                              编辑
                            </a-space>
                          </a-menu-item>
                          <a-menu-item key="delete" :disabled="record.status.value === 20 || !this.principal.hasPermission('perms[form:delete]')">
                            <a-space>
                              <icon-font class="icon" type="icon-ashbin" />
                              删除
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
                <a-input v-model:value="this.form.page.size" size="small" @pressEnter="searchForm(1, $event)" :maxlength="4" class="text-center hidden-xs hidden-sm hidden-md" style="width: 50px" />
                <span class="hidden-xs hidden-sm hidden-md">条 / 第 {{this.form.page.number}} 页</span>
                <a-button size="small" @click="this.searchForm(this.form.page.number - 1)" :disabled="this.form.page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
                <a-button size="small" @click="this.searchForm(this.form.page.number + 1)" :disabled="this.form.page.last"><icon-font type="icon-arrow-right-bold" /></a-button>
              </a-space>

            </div>

          </a-card>
        </a-layout-content>
      </a-layout>
    </a-layout>

    <a-modal v-model:visible="this.form.searchDialogVisible" width="600px" title="查询流程表单" @ok="searchForm(null)" layout="vertical">
      <a-form ref="search-form" :model="this.form.searchData" layout="vertical">

        <a-row>
          <a-col :span="24">
            <a-form-item label="名称:">
              <a-input v-model:value="this.form.searchData['filter_[username_like]']" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="审批方式:">
              <a-select v-model:value="this.form.searchData['filter_[approval_type_eq]']">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option v-for="(value, name) of this.form.approvalTypeOptions" :key="value" :value="value">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-modal>

    <a-modal v-model:visible="this.group.dialogVisible" width="600px" :title="this.group.form.id ? '编辑 [' + this.group.form.name + '] 分组' : '添加分组'" @ok="saveGroup()" layout="vertical">
      <a-spin :spinning="this.group.loading.form">
        <a-form ref="group-form" :model="this.group.form" :rules="this.group.rules" layout="vertical">
          <a-row>
            <a-col :span="24">
              <a-form-item label="名称:" name="name">
                <a-input v-model:value="this.group.form.name" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="24">
              <a-form-item label="备注:" name="remark">
                <a-textarea v-model:value="this.group.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
              </a-form-item>
            </a-col>

          </a-row>

        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>

export default {
  name:"WorkflowFormIndex",
  data() {
    return {
      group:{
        dialogVisible:false,
        loading:{
          table:false,
          form:false,
        },
        selectedIds:[],
        dataSource:[],
        rules: {
          name: [
            { required: true, message: "请输入分组名称", trigger: "change"}
          ],
        },
        form:{
          id:undefined,
          name:"",
          remark:"",
        },
        columns:[{
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 215
        },{
          title: "操作",
          align: "center",
          fixed: "right",
          key: "action",
          width: 110
        }],
      },
      form: {
        columns:[
          {
            title: "名称",
            dataIndex: "name",
            ellipsis: true,
            width: 200
          },
          {
            title: "审批方式",
            dataIndex: "approvalType",
            ellipsis: true,
            width: 200
          },
          {
            title: "状态",
            dataIndex: "status",
            ellipsis: true,
            width: 200
          },{
            title: "所属组",
            dataIndex: "groupName",
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
        selectedIds:[],
        recoverIds:[],
        searchData:{
          "filter_[username_eq]":"",
          "filter_[real_name_like]":"",
          "filter_[email_like]":"",
          "filter_[status_eq]":""
        },
        page: {
          elements:[],
          first:true,
          last:true,
          number:1
        },
        loading: false,
        approvalTypeOptions:[],
        searchDialogVisible: false
      }
    }
  },
  created() {
    this.loadConfigEnumerate({service:"admin", enumerateName:"FormApprovalTypeEnum"}).then((r) => this.form.approvalTypeOptions = r.data.data);
    this.searchGroup();
    this.searchForm();
  },
  methods:{
    handleGroupMenuClick(e, record) {
      if (e.key === "edit") {
        this.editGroup(record);
      } else if (e.key === "delete") {
        if (record) {
          this.confirm("确定要删除 [" + record.name + "] 分组吗?", () => this.removeGroup([record.id]));
        } else {
          this.confirm("确定要删除 " + this.group.selectedIds.length + " 条记录吗?", () => this.removeGroup(this.group.selectedIds));
        }
      }
    },
    handleFormMenuClick(e, record) {
      if (e.key === "edit") {
        this.editForm(record);
      } else if (e.key === "delete") {
        if (record) {
          this.confirm("确定要删除 [" + record.name + "] 表单吗?", () => this.removeForm([record.id]));
        } else {
          this.confirm("确定要删除 " + this.form.selectedIds.length + " 条记录吗?", () => this.removeForm(this.form.selectedIds));
        }
      }
    },
    editGroup(record) {
      this.group.dialogVisible = true;
      this.cleanTypeForm();
      if (record) {
        this.group.loading.form = true;
        this
            .$http
            .get("/api/workflow/group/get?id=" + record.id).then((r) => {
              this.group.form = r.data.data;
              this.group.loading.form = false
            })
            .catch(() => this.group.dialogVisible = false);
      }
    },
    saveGroup() {
      this.$refs["group-form"].validate().then(() => {
        this
            .$http
            .post("/api/workflow/group/save", this.group.form)
            .then((r) => {
              this.$message.success(r.data.message);
              this.searchGroup();
              this.group.dialogVisible = false;
            });
      });
    },
    cleanTypeForm() {
      this.group.form.id = undefined;
      this.group.form.name = "";
      this.group.form.remark = "";
    },
    removeGroup(ids) {
      this.form.loading = true;
      this
          .$http
          .post("/api/workflow/group/delete",this.formUrlEncoded({ids:ids})).then((r) => {
            this.$message.success(r.data.message);
            this.form.selectedIds = [];
            this.searchGroup();
            this.searchForm();
          })
          .catch(() => this.form.loading = false);
    },
    searchGroup() {
      this.group.loading.table = true;
      this
          .$http
          .post("/api/workflow/group/find")
          .then(r => {
            this.group.dataSource = r.data.data;
            this.group.loading.table = false;
          })
          .catch(() => this.group.loading.table = false);
    },
    editForm(record) {

      let to = {
        name: "workflow_form_detail"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    groupSelectChange(selectedIds) {
      this.group.selectedIds = selectedIds;
      this.searchForm(1);
    },
    formSelectChange(selectedIds) {
      this.form.selectedIds = selectedIds;
      this.form.recoverIds = this
          .form
          .page
          .elements
          .filter(e => this.form.selectedIds.includes(e.id))
          .filter(e => e.status.value === 30)
          .map(e => e.id);
    },
    removeForm(ids) {
      this.form.loading = true;
      this
          .$http
          .post("/api/workflow/form/delete",this.formUrlEncoded({ids})).then((r) => {
            this.$message.success(r.data.message);
            this.form.selectedIds = [];
            this.searchForm();
          })
          .catch(() => this.form.loading = false);
    },
    searchForm(number) {

      this.form.loading = true;

      this.form.searchDialogVisible = false;

      let param = this.form.searchData;
      if (this.group.selectedIds.length > 0) {
        param["filter_[group_id_in]"] = this.group.selectedIds;
      }

      param.size = this.form.page.size || 10;
      param.number = number || this.form.page.number;

      this
          .$http
          .post("/api/workflow/form/page",this.formUrlEncoded(param))
          .then(r => {
            this.form.page = r.data.data;
            this.form.loading = false;
          })
          .catch(() => this.form.loading = false);
    }
  }
}

</script>