<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-sign-out" /> 用户登陆信息</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="用户登陆信息管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-sign-out" />
      </template>

      <a-input v-model:value="this.form['filter_[username_eq]']" @pressEnter="this.search(1,$event)" placeholder="请输入登陆账号进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-dropdown-button type="text" size="small" @click="this.search()" :loading="this.loading">
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

      </a-input>

      <a-table class="ant-table-striped" :loading="this.loading" :rowKey="record=>record.id" :scroll="{ x: 775 }" :pagination="false" :data-source="this.page.elements" :columns="this.columns" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'creationTime'">
            {{ this.timestampFormat(record.creationTime) }}
          </template>

          <template v-if="column.dataIndex === 'userType'">
            {{this.getUserTypeName(record.userType)}}
          </template>

          <template v-if="column.dataIndex === 'ipRegion'">
            {{ record.ipRegion.ipAddress + ' ' + (record.ipRegion.country || '') + ' ' + (record.ipRegion.province || '') + ' ' + (record.ipRegion.city || '') + ' ' + (record.ipRegion.district || '')}}
          </template>

          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-space>
                <a-button size="small" @click="detail(record)" v-if="this.principal.hasPermission('perms[authentication_info:get]')">
                  <icon-font class="icon" type="icon-file" />
                  <span class="hidden-xs hidden-sm hidden-md">详情</span>
                </a-button>
              </a-space>
            </div>
          </template>

        </template>

      </a-table>

      <div class="margin-md-top text-right" >

        <a-space>
          <span class="hidden-xs hidden-sm hidden-md">每页</span>
          <a-input v-model:value="this.page.size" size="small" @pressEnter="search(1, $event)" :maxlength="4" class="text-center hidden-xs hidden-sm hidden-md" style="width: 50px" />
          <span class="hidden-xs hidden-sm hidden-md">条 / 第 {{this.page.number}} 页</span>
          <a-button size="small" @click="searchData(this.page.number - 1)" :disabled="this.page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
          <a-button size="small" @click="searchData(this.page.number + 1)" :disabled="this.page.last"><icon-font type="icon-arrow-right-bold" /></a-button>
        </a-space>

      </div>

    </a-card>

    <a-modal v-model:visible="this.searchDialogVisible" width="400px" title="查询用户登陆信息" @ok="search" layout="vertical">
      <a-form ref="search-form" :rules="this.rules" :model="this.form" layout="vertical">

        <a-form-item label="登陆账户:" name="username">
          <a-input v-model:value="this.form['filter_[username_like]']" />
        </a-form-item>

        <a-form-item label="用户类型:" name="userType">
          <a-select class="width-100-percent" v-model:value="this.form['filter_[user_type_eq]']" >
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(value,name) of this.sourceOptions" :key="name" :value="value">
              {{name}}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="操作时间:" name="creationTime">
          <a-range-picker class="width-100-percent" show-time v-model:value="this.form['filter_[creation_time_between]']" />
        </a-form-item>

      </a-form>
    </a-modal>
  </div>
</template>

<script>

export default {
  name:"AuthenticationAuditIndex",
  data() {
    return {
      sourceOptions:[],
      columns:[
        {
          title: "操作时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 200
        },{
          title: "登陆账户",
          dataIndex: "username",
          ellipsis: true,
          width: 200
        },{
          title: "用户类型",
          dataIndex: "userType",
          ellipsis: true,
          width: 200
        },{
          title: "登陆 IP",
          dataIndex: "ipRegion",
          ellipsis: true,
          width: 200
        },{
          title: "操作",
          align: "center",
          fixed: "right",
          key:"action",
          width: 100
        }
      ],
      rules:{
        after: [{ required: true, message: "请选择操作时间", trigger: 'change', type: 'object' }]
      },
      form:{},
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
    this.searchData();
    this.loadConfigEnumerate({service:"config",enumerateName:"ResourceSourceEnum"}).then(r => this.sourceOptions = r.data.data);
  },
  methods:{
    getUserTypeName(userType) {
      for (let key in this.sourceOptions) {
        if (this.sourceOptions[key] === userType) {
          return key
        }
      }
      return userType;
    },
    detail(record) {

      let to = {
        name: "authentication_info_detail"
      }

      if (record !== undefined) {
        to["query"] = { id:record.id};
      }

      this.$router.push(to);

    },
    search() {
      let form = this.$refs['search-form'];
      this.searchDialogVisible = false;

      if (form) {

        form.validate().then(() => this.searchData());
      } else {
        this.searchData();
      }

    },
    searchData(number) {
      let param = this.form;

      param.size = this.page.size || 10;
      param.number = number || this.page.number;
      this.loading = true;

      this
          .$http
          .post("/api/authentication/authentication/info/page", this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>