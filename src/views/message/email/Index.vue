<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-email" /> 邮件消息</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="邮件管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-email" />
      </template>


      <a-input v-model:value="this.form['filter_[title_like]']" @pressEnter="this.search(1)"  placeholder="请输入标题进行查询" class="margin-lg-bottom">
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
                <a-menu-item key="send" :disabled="!this.principal.hasPermission('perms[message:send]')">
                  <a-space>
                    <icon-font class="icon" type="icon-send" />
                    发送邮件
                  </a-space>
                </a-menu-item>
                <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[email:delete]')">
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
        <template #bodyCell="{column, record}">
          <template v-if="column.dataIndex === 'successTime'">
            {{ timestampFormat(record.successTime) }}
          </template>
          <template v-if="column.dataIndex === 'lastSendTime'">
            {{ timestampFormat(record.lastSendTime) }}
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
                    <a-menu-item key="detail" :disabled="!this.principal.hasPermission('perms[email:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-file" />
                        详情
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[email:delete]')">
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

    <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询邮件消息" @ok="search(null)" layout="vertical">
      <a-form ref="search-form" :model="form" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="标题:">
              <a-input v-model:value="form['filter_[title_like]']" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="内容:">
              <a-input v-model:value="form['filter_[content_eq]']" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
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
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="状态:">
              <a-select v-model:value="form['filter_[execute_status_eq]']">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option v-for="(value, name) of statusOptions" :key="value" :value="value">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="发送邮件:">
              <a-input v-model:value="form['filter_[from_like]']" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="收取邮件:">
              <a-input v-model:value="form['filter_[to_like]']" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="最后发送时间:">
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
  name:"MessageEmailIndex",
  data() {
    return {
      columns:[
        {
          title: "状态",
          dataIndex: "executeStatus",
          ellipsis: true,
          width: 100
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
        },{
          title: "操作",
          align: "center",
          key:"action",
          fixed: "right",
          width: 110,
        }
      ],
      selectedIds:[],
      form:{
        "filter_[title_like]":"",
        "filter_[content_eq]":"",
        "filter_[type_eq]":"",
        "filter_[execute_status_eq]":"",
        "filter_[from_like]":"",
        "filter_[to_like]":"",
        "filter_[creation_time_between]":[]
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      loading: false,
      statusOptions:[],
      typeOptions:[],
      searchDialogVisible: false
    }
  },
  created() {

    this.loadConfigEnumerates({config:[{id:"MessageTypeEnum"}, {id:"ExecuteStatus"}]}).then((r) => {
      this.typeOptions = r.data.data.config.MessageTypeEnum;
      this.statusOptions = r.data.data.config.ExecuteStatus;
    });

    this.search();
  },
  methods:{
    handleMenuClick(e, record) {
      if (e.key === "send") {
        this.send();
      } else if (e.key === 'delete') {
        if (record) {
          this.confirm("确定要删除该记录吗？",() => this.remove([record.id]));
        } else if (this.selectedIds.length > 0) {
          this.confirm("确定要删除 " + this.selectedIds.length + " 条记录吗？",() => this.remove(this.selectedIds));
        }
      } else if (e.key === "detail") {
        this.detail(record);
      }
    },
    send() {
      this.$router.push({name:"message_email_send"});
    },
    detail(record) {

      let to = {
        name: "message_email_detail"
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
          .post("/api/message/email/delete",this.formUrlEncoded({ids:ids})).then((r) => {
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
          .post("/api/message/email/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>