<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-dynamic" /> 站点动态</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="站点动态" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-dynamic" />
      </template>

      <a-input v-model:value="this.form['filter_[title_like]_or_[content_like]']" @pressEnter="this.search(1)"  placeholder="请输入标题/内容进行查询" class="margin-lg-bottom">
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
          <a-dropdown size="small" type="text" placement="bottomLeft">
            <template #overlay>
              <a-menu @click="handleMenuClick" >
                <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[notice:save]')">
                  <a-space>
                    <icon-font class="icon" type="icon-add" />
                    添加
                  </a-space>
                </a-menu-item>
                <a-menu-item key="publish" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[notice:publish]')">
                  <a-space>
                    <icon-font class="icon" type="icon-select" />
                    发布选中({{this.selectedIds.length}})
                  </a-space>
                </a-menu-item>
                <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[notice:delete]')">
                  <a-space>
                    <icon-font class="icon" type="icon-ashbin" />
                    删除选中({{this.selectedIds.length}})
                  </a-space>
                </a-menu-item>
                <a-menu-item key="hotOrNot" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[notice:hot_or_not]')">
                  <a-space>
                    <icon-font class="icon" type="icon-hot-o" />
                    标记为热门/非热门({{this.selectedIds.length}})
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
          <template v-if="column.dataIndex === 'title'">
            <template v-if="record.remark">

              <a-typography-text type="danger" class="margin-xss-right" v-if="record.hot.value === 1">
                <icon-font class="icon" type="icon-hot-o"/>
              </a-typography-text>
              <a-tooltip :title="record.remark">
                <a-typography-text type="warning">
                  <icon-font class="icon" type="icon-help"/>
                </a-typography-text>
              </a-tooltip>
              {{record.title}}
            </template>
            <template v-else>
              <a-typography-text type="danger"  v-if="record.hot.value === 1">
                <icon-font class="icon" type="icon-hot-o"/>
              </a-typography-text>
              {{record.title}}
            </template>
          </template>
          <template v-if="column.dataIndex === 'type'">
            {{record.type.name}}
          </template>
          <template v-if="column.dataIndex === 'status'">
            {{record.status.name}}
          </template>
          <template v-if="column.dataIndex === 'creationTime'">
            {{timestampFormat(record.creationTime)}}
          </template>
          <template v-if="column.dataIndex === 'publishTime'">
            {{timestampFormat(record.publishTime)}}
          </template>
          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-dropdown size="small" type="text" placement="bottomRight">
                <template #overlay>
                  <a-menu @click="handleMenuClick($event, record)" >
                    <a-menu-item key="publish" :disabled="!this.principal.hasPermission('perms[notice:publish]')">
                      <a-space>
                        <icon-font class="icon" type="icon-select" />
                        发布
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[notice:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-edit" />
                        编辑
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[notice:delete]')">
                      <a-space>
                        <icon-font class="icon" type="icon-ashbin" />
                        删除
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="hotOrNot" :disabled="!this.principal.hasPermission('perms[notice:hot_or_not]')">
                      <a-space>
                        <icon-font class="icon" type="icon-hot-o" />
                        标记为热门/非热门
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

    <a-modal v-model:visible="this.searchDialogVisible" class="width" title="查询公告" @ok="search(null)" layout="vertical">
      <a-form ref="search-form" :model="this.form" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="标题:">
              <a-input v-model:value="this.form['filter_[title_like]']" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="内容:">
              <a-input v-model:value="this.form['filter_[content_like]']" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="类型:">
              <a-select v-model:value="this.form['filter_[type_eq]']">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option v-for="(value, name) of this.typeOptions" :key="value" :value="value">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="发布人:">
              <a-input v-model:value="this.form['filter_[username_eq]']" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="发布时间:" name="publishTime">
              <a-range-picker show-time class="width-100-percent" v-model:value="form['filter_[publish_time_between]']">
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
  name:"MessageNoticeIndex",
  data() {
    return {
      columns:[{
          title: "标题",
          dataIndex: "title",
          ellipsis: true,
          width: 300
        }, {
          title: "创建时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 200
        }, {
          title: "创建人",
          dataIndex: "username",
          ellipsis: true,
          width: 100
        }, {
          title: "发布时间",
          dataIndex: "publishTime",
          ellipsis: true,
          width: 200
        }, {
          title: "状态",
          dataIndex: "status",
          ellipsis: true,
          width: 80
        }, {
          title: "操作",
          align: "center",
          fixed: "right",
          key: "action",
          width: 110
        }
      ],
      selectedIds:[],
      form:{
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
      typeOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.loadConfigEnumerate({service:"admin", enumerateName:"MessageTypeEnum"}).then((r) => this.typeOptions = r.data.data);
    this.search();
  },
  methods:{
    handleMenuClick(e, record) {
      if (e.key === "edit") {
        this.edit(record);
      } else if (e.key === 'publish') {
        if (record) {
          this.confirm("确定要发布[" + record.title + "] 公告吗？",() => this.publish([record.id]));
        } else if (this.selectedIds.length > 0) {
          this.confirm("确定要发布 " + this.selectedIds.length + " 条记录吗？",() => this.publish(this.selectedIds));
        }
      } else if (e.key === 'delete') {
        if (record) {
          this.confirm("确定要删除[" + record.title + "] 公告吗？",() => this.remove([record.id]));
        } else if (this.selectedIds.length > 0) {
          this.confirm("确定要删除 " + this.selectedIds.length + " 条记录吗？",() => this.remove(this.selectedIds));
        }
      } else if (e.key === "hotOrNot") {
        if (record) {
          this.confirm("确定要标记[" + record.title + "]为热门/非热门动态吗?",() => this.hotOrNot([record.id]));
        } else if (this.selectedIds.length > 0) {
          this.confirm("确定要标记" + this.selectedIds.length + "条记录为热门/非热门动态吗?",() => this.hotOrNot(this.selectedIds));
        }
        this.hotOrNot(record);
      }
    },
    edit(record) {

      let to = {
        name: "message_notice_edit"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    publish(ids) {
      this.loading = true;

      this
          .$http
          .post("/api/message/notice/publish", this.formUrlEncoded({ids})).then((r) => {
            this.$message.success(r.data.message);
            this.selectedIds = [];
            this.search();
          })
          .catch(() => this.loading = false);
    },
    hotOrNot(ids) {
      let records = this.page.elements.filter((r => ids.includes(r.id)));

      let hot = records.filter(r => r.hot.value !== 1).map(r => r.id);
      let notHot = records.filter(r => r.hot.value === 1).map(r => r.id);

      if (hot.length <= 0 && notHot.length <= 0) {
        return ;
      }

      this.loading = true;

      this
          .$http
          .post("/api/message/notice/hotOrNot", {hot, notHot}).then((r) => {
            this.$message.success(r.data.message);
            this.selectedIds = [];
            this.search();
          })
          .catch(() => this.loading = false);
    },
    remove(ids) {

      this.loading = true;
      this
          .$http
          .post("/api/message/notice/delete",this.formUrlEncoded({ids:ids})).then((r) => {
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
          .post("/api/message/notice/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>