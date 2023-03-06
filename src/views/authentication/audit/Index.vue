<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-audit" /> 操作审计</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="操作审计管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-audit" />
      </template>

      <a-input v-model:value="this.form.principal" @pressEnter="this.search(1,$event)"  placeholder="请输入操作人进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-dropdown-button type="text" size="small" @click="this.search" :loading="this.loading">
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

      <a-table :loading="this.loading" class="ant-table-striped" :rowKey="record=>record.id" :scroll="{ x: 775 }" :pagination="false" :data-source="this.page.elements" :columns="this.columns" bordered>
        <template #bodyCell="{ column, record}">
          <template v-if="column.dataIndex === 'timestamp'">
            {{ this.timestampFormat(record.timestamp.toString().replace(".","") * 1) }}
          </template>

          <template v-if="column.dataIndex === 'type'">
            {{ record.type.substring(0, record.type.lastIndexOf(":")) }}
          </template>

          <template v-if="column.dataIndex === 'realName'">
            {{ record.meta ? record.meta.realName || '' : ''}}
          </template>

          <template v-if="column.dataIndex === 'result'">
            <a-badge :status="record.type.substring(record.type.lastIndexOf(':') + 1, record.type.length) === 'SUCCESS' ? 'success' : 'error'" :text="record.type.substring(record.type.lastIndexOf(':') + 1, record.type.length) === 'SUCCESS' ? '成功' : '失败'" />

          </template>

          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-space>
                <a-button size="small" @click="detail(record)" v-if="this.principal.hasPermission('perms[audit:get]')">
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
          <a-button size="small" @click="searchData(page.number - 1)" :disabled="this.page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
          <a-button size="small" @click="searchData(page.number + 1)" :disabled="this.page.last"><icon-font type="icon-arrow-right-bold" /></a-button>
        </a-space>

      </div>

    </a-card>

    <a-modal v-model:visible="this.searchDialogVisible" width="400px" title="查询操作审计" @ok="search" layout="vertical">
      <a-form ref="search-form" :rules="this.rules" :model="this.form" layout="vertical">

        <a-row>

          <a-col :span="24">
            <a-form-item label="操作人:" name="principal">
              <a-input v-model:value="this.form.principal" />
            </a-form-item>
          </a-col>

        </a-row>

        <a-row>

          <a-col :span="24">
            <a-form-item label="操作模块:" name="type">
              <a-input v-model:value="this.form.type" />
            </a-form-item>
          </a-col>

        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="操作时间:" name="after">
              <a-date-picker class="width-100-percent" show-time v-model:value="this.form.after" />
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-modal>
  </div>
</template>

<script>

export default {
  name:"AuthenticationAuditIndex",
  data() {
    return {
      columns:[
        {
          title: "操作时间",
          dataIndex: "timestamp",
          ellipsis: true,
          width: 200
        },
        {
          title: "操作人",
          dataIndex: "principal",
          ellipsis: true,
          width: 200
        },
        {
          title: "真实姓名",
          dataIndex: "realName",
          ellipsis: true,
          width: 200
        },
        {
          title: "操作模块",
          dataIndex: "type",
          ellipsis: true,
          width: 200
        },
        {
          title: "操作结果",
          dataIndex: "result",
          ellipsis: true,
          width: 200
        },
        {
          title: "操作",
          align: "center",
          fixed: "right",
          key:"action",
          width: 110
        }
      ],
      rules:{
        after: [{ required: true, message: "请选择操作时间", trigger: 'change', type: 'object' }]
      },
      form:{
        principal:"",
        type:"",
        after:this.$dayjs().startOf("d")
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
    this.searchData();
  },
  methods:{
    detail(record) {

      let to = {
        name: "authentication_audit_detail"
      }

      if (record !== undefined) {
        to["query"] = { id:record.id, after:record.timestamp.toString().replace(".","") };
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
          .post("/api/authentication/operational/audit/page", this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>