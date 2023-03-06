<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-comment" /> 评论消息</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="评论消息" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-comment" />
      </template>

      <a-input v-model:value="this.form['filter_[content_like]']" @pressEnter="this.search(1)"  placeholder="请输入内容进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-dropdown-button type="text" size="small" :loading="this.loading" @click="this.search(1)">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
            <template #overlay>
              <a-menu @click="this.searchDialogVisible = true;">
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
          <a-button danger @click="this.confirm('确定要删除该记录吗？',() => this.remove(this.selectedIds));" type="text" size="small" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[evaluate:delete]')">
            <icon-font class="icon" type="icon-ashbin" />
            删除选中({{this.selectedIds.length}})
          </a-button>
        </template>
      </a-input>

      <a-table :loading="this.loading" class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange:this.selectChange }" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.page.elements" :columns="this.columns" bordered>
        <template #bodyCell="{column, record}">
          <template v-if="column.dataIndex === 'username'">
            <a-space>
              <a-avatar :src="'/api/resources/avatar/get?filename=' + record.userType + '/' + record.userId + '/current&date=' + this.$dayjs().unix()" />
              {{record.username}}
            </a-space>
          </template>
          <template v-if="column.dataIndex === 'creationTime'">
            {{ timestampFormat(record.creationTime) }}
          </template>
          <template v-if="column.dataIndex === 'targetType'">
            {{ record.targetType }}
          </template>
          <template v-if="column.dataIndex === 'anonymous'">
            {{ record.anonymous.name }}
          </template>
          <template v-if="column.dataIndex === 'content'">
            <template v-if="record.content">
            {{ record.content.replace(/<[^>]+>/g, '').replace(/&[a-zA-Z]{1,10};/g, '') }}
            </template>
          </template>
          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-dropdown size="small" type="text" placement="bottomRight">
                <template #overlay>
                  <a-menu @click="handleMenuClick($event, record)" >
                    <a-menu-item key="detail" :disabled="!this.principal.hasPermission('perms[evaluate:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-file" />
                        详情
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[evaluate:delete]')">
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

        <a-form-item label="评价时间:">
          <a-range-picker show-time class="width-100-percent" v-model:value="form['filter_[creation_time_between]']">
            <template #suffixIcon>
              <icon-font class="icon" type="icon-calendar" />
            </template>
          </a-range-picker>
        </a-form-item>

        <a-form-item label="评论人:">
          <a-input v-model:value="form['filter_[username_like]']" />
        </a-form-item>

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="目标名称:">
              <a-input v-model:value="form['filter_[target_name_like]']" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="目标类型:">
              <a-select v-model:value="form['filter_[target_type_eq]']">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option v-for="(value, name) of targetTypeOptions" :key="value" :value="value">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="评价内容:">
          <a-textarea v-model:value="form['filter_[content_like]']" :auto-size="{ minRows: 5, maxRows: 10 }"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>

export default {
  name:"MessageCommentIndex",
  data() {
    return {
      columns:[{
          title: "评论人",
          dataIndex: "username",
          ellipsis: true,
          width: 200
        },
        {
          title: "评论时间",
          dataIndex: "creationTime",
          width: 200,
          ellipsis: true,
        },
        {
          title: "目标名称",
          dataIndex: "targetName",
          ellipsis: true,
        },
        {
          title: "目标类型",
          dataIndex: "targetType",
          ellipsis: true,
        },
        {
          title: "是否匿名",
          dataIndex: "anonymous",
          ellipsis: true,
          width: 100
        },
        {
          title: "评价内容",
          dataIndex: "content",
          ellipsis: true
        },
        {
          title: "操作",
          align: "center",
          key:"action",
          fixed: "right",
          width: 110,
        }
      ],
      selectedIds:[],
      form:{
        "filter_[username_like]":"",
        "filter_[target_name_like]":"",
        "filter_[target_type_eq]":"",
        "filter_[content_like]":"",
        "filter_[creation_time_between]":[]
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      loading: false,
      targetTypeOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.loadConfigEnumerate({service:"message", enumerateName:"CommentMessageTypeEnum"}).then((r) => this.targetTypeOptions = r.data.data);

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
    detail(record) {

      let to = {
        name: "message_comment_detail"
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
          .post("/api/message/comment/delete",this.formUrlEncoded({ids:ids})).then((r) => {
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
          .post("/api/message/comment/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>