<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 机构管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-system-user" /> 系统用户管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="系统用户管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-system-user" />
      </template>

      <a-input v-model:value="this.form['filter_[username_like]_or_[real_name_like]_or_[phone_number_like]_or_[email_like]']" @pressEnter="this.search(1)" placeholder="请输入登陆账户/真实姓名/电话号码/邮箱进行查询" class="margin-lg-bottom">
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
                <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[console_user:save]')">
                  <a-space>
                    <icon-font class="icon" type="icon-add" />
                    添加
                  </a-space>
                </a-menu-item>
                <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[console_user:delete]')">
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
          <template v-if="column.dataIndex === 'realName'">
            <template v-if="record.remark">
              <a-tooltip :title="record.remark">
                <a-typography-text type="warning">
                  <icon-font class="icon" type="icon-help"/>
                </a-typography-text>
              </a-tooltip>
              {{record.realName}}
            </template>
            <template v-else>
              {{record.realName}}
            </template>
          </template>
          <template v-if="column.dataIndex === 'status'">
            {{record.status.name}}
          </template>
          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-dropdown size="small" type="text" placement="bottomLeft">
                <template #overlay>
                  <a-menu @click="handleMenuClick($event, record)" >
                    <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[console_user:save]')">
                      <a-space>
                        <icon-font class="icon" type="icon-edit" />
                        编辑
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="modifyPassword" :disabled="!this.principal.hasPermission('perms[console_user:config_update_password]')">
                      <a-space>
                        <icon-font class="icon" type="icon-unlock" />
                        修改密码
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[console_user:delete]')">
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

    <a-modal :mask-closable="false" :ok-button-props="{ disabled: this.modifyPassword.spinning.dialog }" v-model:visible="this.modifyPassword.dialogVisible" :title="this.modifyPassword.username ? '修改 [' + this.modifyPassword.username + '] 登陆密码' : ''" @ok="submitModifyPassword()" layout="vertical">
      <a-spin :spinning="this.modifyPassword.spinning">
        <a-form ref="modify-password-form" :model="this.modifyPassword.form" layout="vertical">
          <a-form-item label="新密码:" name="newPassword" :rules='[{ required: true, message: "新密码不能为空", trigger: "change"},{ type:"string", pattern: /^(?!^[0-9a-z]+$)(?!^[0-9A-Z]+$)(?!^[0-9\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[a-zA-Z]+$)(?!^[a-z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)[a-z0-9A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$/, message:"密码段中在要求的四种(大写字母，小写字母，数字，标点符号)类型中至少存在三种"}]'>
            <a-input-password v-model:value="this.modifyPassword.form.newPassword"/>
          </a-form-item>
          <a-form-item label="确认密码:" name="confirmPassword" :rules='[{ required: true, message: "确认密码不能为空", trigger: "change" }, { validator:this.validatePassword, trigger: "change"}]'>
            <a-input-password v-model:value="this.modifyPassword.form.confirmPassword" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>

    <a-modal v-model:visible="this.searchDialogVisible" class="width" title="查询后台用户" @ok="search(null)" layout="vertical">
      <a-form ref="search-form" :model="this.form" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="登陆账户:">
              <a-input v-model:value="this.form['filter_[username_like]']" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="真实姓名:">
              <a-input v-model:value="this.form['filter_[real_name_like]']" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="电子邮箱:">
              <a-input v-model:value="this.form['filter_[email_like]']" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="状态:">
              <a-select v-model:value="this.form['filter_[status_eq]']">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option v-for="(value, name) of this.statusOptions" :key="value" :value="value">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="联系电话:">
              <a-input v-model:value="this.form['filter_[phone_number_eq]']" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form-item label="性别:">
              <a-select v-model:value="this.form['filter_[gender_eq]']">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option v-for="(value, name) of this.genderOptions" :key="value" :value="value">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-modal>
  </div>
</template>

<script>

export default {
  name:"AuthenticationConsoleUserIndex",
  data() {
    return {
      columns:[
        {
          title: "登陆账号",
          dataIndex: "username",
          ellipsis: true,
          width: 200
        }, {
          title: "真实姓名",
          dataIndex: "realName",
          ellipsis: true,
          width: 200
        }, {
          title: "电子邮箱",
          dataIndex: "email",
          ellipsis: true,
          width: 200
        }, {
          title: "电话号码",
          dataIndex: "phoneNumber",
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
      modifyPassword:{
        spinning:false,
        dialogVisible:false,
        username:undefined,
        form:{
          id:undefined,
          newPassword:'',
          confirmPassword:''
        }
      },
      loading: false,
      statusOptions:[],
      genderOptions:[],
      searchDialogVisible: false
    }
  },
  created() {

    this.loadConfigEnumerates({config:[{id:"UserStatus"}, {id:"GenderEnum"}]}).then((r) => {
      this.statusOptions = r.data.data.config.UserStatus;
      this.genderOptions = r.data.data.config.GenderEnum;
    });

    this.search();
  },
  methods:{
    async validatePassword() {
      if (this.modifyPassword.form.confirmPassword !== this.modifyPassword.form.newPassword) {
        return Promise.reject('新密码与确认密码不一致');
      } else {
        return Promise.resolve();
      }
    },
    submitModifyPassword() {
      this.$refs["modify-password-form"].validate().then(() =>{
        this.modifyPassword.spinning = true;
        this
            .$http
            .post("/api/authentication/console/user/adminUpdatePassword", this.formUrlEncoded(this.modifyPassword.form))
            .then(r => {
              this.$message.success(r.data.message);
              this.modifyPassword.spinning = false;
              this.modifyPassword.dialogVisible = false;
            }).catch(() => this.modifyPassword.spinning = false);
      })
    },
    handleMenuClick(e, record) {
      if (e.key === "edit") {
        this.edit(record);
      } else if (e.key === "delete") {
        if (record) {
          this.confirm("确定要删除 [" + record.realName + "] 用户吗?", () => this.remove([record.id]));
        } else {
          this.confirm("确定要删除 " + this.selectedIds.length + " 条记录吗?", () => this.remove(this.selectedIds));
        }
      } else if (e.key === 'modifyPassword') {
        this.modifyPassword.dialogVisible = true;
        this.modifyPassword.username = record.realName || record.username;
        this.modifyPassword.form.id = record.id;
        this.modifyPassword.form.newPassword = "";
        this.modifyPassword.form.confirmPassword = "";
      }
    },
    edit(record) {

      let to = {
        name: "authentication_console_user_edit"
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
          .post("/api/authentication/console/user/delete",this.formUrlEncoded({ids:ids})).then((r) => {
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
          .post("/api/authentication/console/user/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>