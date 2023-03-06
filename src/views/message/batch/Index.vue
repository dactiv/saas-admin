<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-batch" /> 批量消息</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="批量消息管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-batch" />
      </template>

      <a-input v-model:value="this.form['filter_[name_like]']" @pressEnter="this.search(1)" placeholder="请输入名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" @click="this.search" :loading="this.loading">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-dropdown-button :loading="loading" size="small" @click="search(this.page.number)" type="text" placement="bottomLeft">
            <icon-font class="icon" v-if="!loading" type="icon-refresh" />
            刷新
            <template #overlay>
              <a-menu @click="handleMenuClick" >
                <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[batch_message:delete]')">
                  <a-space>
                    <icon-font class="icon" type="icon-ashbin" />
                    删除选中({{this.selectedIds.length}})
                  </a-space>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown-button>
        </template>
      </a-input>

      <a-table :loading="loading" class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange:this.selectChange }" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.page.elements" :columns="this.columns" bordered>

        <template #bodyCell="{column, record}">
          <template v-if="column.dataIndex === 'creationTime'">
            {{ timestampFormat(record.creationTime) }}
          </template>
          <template v-if="column.dataIndex === 'completeTime'">
            {{ timestampFormat(record.completeTime) }}
          </template>
          <template v-if="column.dataIndex === 'executeStatus'">
            {{ record.executeStatus.name }}
          </template>
          <template v-if="column.dataIndex === 'type'">
            {{ record.type.name }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-dropdown size="small" type="text" placement="bottomRight">
                <template #overlay>
                  <a-menu @click="handleMenuClick($event, record)" >
                    <a-menu-item key="detail" :disabled="!this.principal.hasPermission('perms[batch_message:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-file" />
                        详情
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[batch_message:delete]')">
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
          <a-input v-model:value="page.size" size="small" @pressEnter="search(1,$event)" :maxlength="4" class="text-center hidden-xs hidden-sm hidden-md" style="width: 50px" />
          <span class="hidden-xs hidden-sm hidden-md">条 / 第 {{page.number}} 页</span>
          <a-button size="small" @click="search(page.number - 1)" :disabled="page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
          <a-button size="small" @click="search(page.number + 1)" :disabled="page.last"><icon-font type="icon-arrow-right-bold" /></a-button>

        </a-space>

      </div>

    </a-card>

    <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询批量消息" @ok="search(null)" layout="vertical">
      <a-form ref="search-form" :model="form" layout="vertical">

        <a-row>
          <a-col :span="24">
            <a-form-item label="类型:">
              <a-select v-model:value="form['filter_[type_eq]']">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option v-for="(value, name) of typeOptions" :key="value" :value="value">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="完成时间:">
              <a-range-picker show-time class="width-100-percent" v-model:value="form['filter_[complete_time_between]']">
                <template #suffixIcon>
                  <icon-font class="icon" type="icon-calendar" />
                </template>
              </a-range-picker>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="创建时间:">
              <a-range-picker show-time class="width-100-percent" v-model:value="form['filter_[creation_time_between]']">
                <template #suffixIcon>
                  <icon-font class="icon" type="icon-calendar" />
                </template>
              </a-range-picker>
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-modal>
  </div>
</template>

<script>

export default {
  name:"MessageBatchIndex",
  data() {
    return {
      columns:[
        {
          title: "类型",
          dataIndex: "type",
          ellipsis: true,
          width: 80
        },
        {
          title: "创建时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 200,
        },
        {
          title: "状态",
          dataIndex: "executeStatus",
          ellipsis: true,
          width: 80
        },
        {
          title: "总发送数量",
          dataIndex: "count",
          ellipsis: true,
          width: 200
        },{
          title: "完成时间",
          dataIndex: "completeTime",
          ellipsis: true,
          width: 200,
        },{
          title: "操作",
          align: "center",
          fixed: "right",
          key:"action",
          width: 110,
        }
      ],
      selectedIds:[],
      form:{
        "filter_[type_eq]":"",
        "filter_[creation_time_between]":"",
        "filter_[complete_time_between]":[]
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      loading: false,
      typeOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.loadConfigEnumerate({service:"message", enumerateName:"AttachmentTypeEnum"}).then((r) => this.typeOptions = r.data.data);
    this.search(1);
  },
  methods:{
    handleMenuClick(e, record) {
      if (e.key === 'delete') {
        if (record) {
          this.confirm("确定要删除该记录吗？", () => this.remove([record.id]));
        } else if (this.selectedIds.length > 0) {
          this.confirm("确定要删除" + this.selectedIds.length + "条记录吗?", () => this.remove(this.selectedIds));
        }
      } else if (e.key === "detail") {
        this.detail(record);
      }
    },
    detail(record) {

      let to = {
        name: "message_batch_detail"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
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
          .post("/api/message/batch/delete",this.formUrlEncoded({ids:ids})).then((r) => {
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
          .post("/api/message/batch/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>