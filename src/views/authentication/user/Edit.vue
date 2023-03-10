<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 机构管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'authentication_console_user'}"> <icon-font class="icon" type="icon-system-user" /> 系统用户管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (this.form.id ? '编辑 [' + this.form.username + '] ': '添加') + '系统用户' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(this.form.id ? '编辑 [' + this.form.username + '] ': '添加') + '系统用户'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-form ref="edit-form" :model="this.form" :rules="this.rules" layout="vertical">

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="真实姓名:" name="realName">
                <a-input v-model:value="this.form.realName" @change="realNameChange"/>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="登陆账户:" name="username">
                <a-input ref="username" v-model:value="this.form.username" autocomplete="username" :disabled="this.form.id !== null" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="联系电话:" name="phoneNumber">
                <a-input v-model:value="this.form.phoneNumber"  autocomplete="phoneNumber" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="性别:" name="gender">
                <a-select class="width-100-percent" v-model:value="this.form.gender">
                  <a-select-option v-for="(value, name) of this.genderOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row v-if="this.form.id === null" :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="登陆密码:" name="password">
                <a-input-password v-model:value="this.form.password" autocomplete="new-password" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="确认密码:" name="confirmPassword">
                <a-input-password v-model:value="this.form.confirmPassword" autocomplete="new-password" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="电子邮箱:" name="email">
                <a-input ref="email" v-model:value="this.form.email" :disabled="this.form.id !== null" />
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12" >

              <a-form-item label="状态:" name="status">
                <a-select class="width-100-percent" v-model:value="this.form.status">
                  <a-select-option v-for="(value, name) of this.statusOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="24">
              <a-form-item label="备注:" name="remark">
                <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
              </a-form-item>
            </a-col>

          </a-row>

        </a-form>

        <a-tabs>

          <a-tab-pane key="group-table">
            <template #tab>
              <icon-font class="icon" type="icon-group" />
              <span class="hidden-xs hidden-sm hidden-md">拥有角色</span>
            </template>
            <group-table ref="group-table" :enable-checkbox="true" :searchData='{mergeTree:true, "filter_[status_eq]": 1, "filter_[sources_jin]":["\"CONSOLE\""]}' :created-search="true" v-model:selected-ids="this.selectedGroupIds"/>
          </a-tab-pane>

          <a-tab-pane key="resource-table" forceRender>
            <template #tab>
              <icon-font class="icon" type="icon-attachment" />
              <span class="hidden-xs hidden-sm hidden-md">独立权限</span>
            </template>
            <resource-table ref="resource-table" :selection="true" :searchData="{mergeTree:true, sources:['CONSOLE']}" :created-search="true" v-model:selected-ids="this.selectedResourceIds"/>
          </a-tab-pane>

          <a-tab-pane key="department-table" forceRender>
            <template #tab>
              <icon-font class="icon" type="icon-department" />
              <span class="hidden-xs hidden-sm hidden-md">所属部门</span>
            </template>
            <department-table ref="department-table" :searchData="{mergeTree:true, 'filter_[type_eq]':30}"  :created-search="true" v-model:selected-ids="this.selectedDepartmentIds"/>
          </a-tab-pane>

        </a-tabs>

        <a-divider />

        <a-space>
          <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[console_user:save]')" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
            <span class="hidden-xs hidden-sm hidden-md">保存</span>
          </a-button>
        </a-space>

      </a-spin>

    </a-card>
  </div>
</template>

<script>


import GroupTable from '@/components/authentication/GroupTable.vue';
import ResourceTable from "@/components/authentication/ResourceTable";
import DepartmentTable from "@/components/authentication/DepartmentTable";

export default {
  name:"AuthenticationConsoleUserEdit",
  components:{GroupTable, ResourceTable, DepartmentTable},
  inject:['reload'],
  data() {
    return {
      spinning:true,
      statusOptions:[],
      genderOptions:[],
      selectedGroupIds:[],
      selectedResourceIds:[],
      selectedDepartmentIds:[],
      form: {
        id: null,
        username: "",
        realName: "",
        password: "",
        groupsInfo:[],
        resourceMap:{},
        departmentInfo:[],
        confirmPassword:"",
        email: undefined,
        remark: "",
        status: "1"
      },
      rules: {
        username: [
          { required: true, message: "请输入登陆账户", trigger: "change"},
          { validator:this.validateRemoteUsername, trigger: "change"}
        ],
        gender: [{ required: true, message: "请选择性别", trigger: "change" }],
        realName: [{ required: true, message: "请输入真实姓名", trigger: "change" }],
        phoneNumber: [
          { validator:this.validateRemotePhoneNumber, trigger: "change"},
          { required: true, message: "请输入联系电话", trigger: "change" },
          { type:"string", pattern: /^[1](([3|5|8][\d])|([4][4,5,6,7,8,9])|([6][2,5,6,7])|([7][^9])|([9][1,8,9]))[\d]{8}$/, message:"联系电话格式不正确，请输入手机号码"}
        ],
        password: [
          { required: true, message: "请输入登陆密码", trigger: "change"},
          { type:"string", pattern: /^(?!^[0-9a-z]+$)(?!^[0-9A-Z]+$)(?!^[0-9\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[a-zA-Z]+$)(?!^[a-z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)[a-z0-9A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$/, message:"密码段中在要求的四种(大写字母，小写字母，数字，标点符号)类型中至少存在三种"}
        ],
        confirmPassword: [
          { required: true, message: "请输入确认密码", trigger: "change" },
          { validator:this.validatePassword, trigger: "change"}
        ],
        email: [
          {type: "email", message:"电子邮箱格式不正确",trigger: "change"},
          {validator:this.validateRemoteEmail, trigger: "change"}
        ]
      }
    }
  },
  methods: {
    realNameChange() {
      if (this.form.id === null) {
        this.form.username = this.$pinyin(this.form.realName,{ toneType: 'none' }).replace(/\s+/g,"");
      }
    },
    validateRemotePhoneNumber() {
      if (this.form.id !== null || this.form.phoneNumber === '') {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/api/authentication/console/user/isPhoneNumberUnique?phoneNumber=" + this.form.phoneNumber).then(r => {
          return r.data.data ? resolve() : reject("手机号码已存在");
        });
      });
    },
    validateRemoteUsername() {
      if (this.form.id !== null || this.form.username === '') {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/api/authentication/console/user/isUsernameUnique?username=" + this.form.username).then(r => {
          return r.data.data ? resolve() : reject("登陆账户已存在");
        });
      });
    },
    validateRemoteEmail() {
      if (this.form.id !== null || this.form.email === '') {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/api/authentication/console/user/isEmailUnique?email=" + this.form.email).then(r => {
          return r.data.data ? resolve() : reject("电子邮箱已存在");
        });
      });
    },
    async validatePassword() {
      if (this.form.confirmPassword !== this.form.password) {
        return Promise.reject('登陆密码与确认密码不一致');
      } else {
        return Promise.resolve();
      }
    },
    submitForm() {

      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        let groups = this.$refs['group-table'].getSelectedRecords();
        this.form.groupsInfo = [];
        if (groups.length > 0) {
          this.form.groupsInfo = groups.map(r => {
            return {
              id:r.id,
              name:r.name,
              authority: r.authority
            };
          });
        }

        let resources = this.$refs['resource-table'].getSelectedRecords();
        this.form.resourceMap = {};
        if (resources.length > 0) {
          let resourceMap = {};
          resources.forEach(r => {
            if (!resourceMap[r.applicationName]) {
              resourceMap[r.applicationName] = [];
            }
            resourceMap[r.applicationName].push(r.id);
          })
          this.form.resourceMap = resourceMap;
        }

        let departments = this.$refs['department-table'].getSelectedRecords();
        this.form.departmentsInfo = [];
        if (departments.length > 0) {
          this.form.departmentsInfo = departments.map(r => {
            return {
              id:r.id,
              name:r.name
            }
          });
        }

        this
            .$http
            .post("/api/authentication/console/user/save",this.form)
            .then((r) => {
              let id = r.data.data;
              this.$message.success(r.data.message);

              this.spinning = false;

              if (id !== this.form.id) {
                this
                    .$router
                    .push({name:"authentication_console_user_edit", query:{id}, replace:true})
                    .then(() => this.reload());
              } else {
                this.reload();
              }

            })
            .catch(() => this.spinning = false);

      });

    }
  },
  created() {

    this.loadConfigEnumerates({config:[{id:"UserStatus"}, {id:"GenderEnum"}]}).then((r) => {
      this.statusOptions = r.data.data.config.UserStatus;
      this.genderOptions = r.data.data.config.GenderEnum;
    });

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/api/authentication/console/user/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;

            this.form.status = this.form.status.value;
            this.form.gender = this.form.gender.value;

            if (this.form.departmentsInfo && this.form.departmentsInfo.length > 0) {
              this.selectedDepartmentIds = this.form.departmentsInfo.map(d => d.id);
            }

            if (this.form.groupsInfo && this.form.groupsInfo.length > 0) {
              this.selectedGroupIds = this.form.groupsInfo.map(d => d.id);
            }

            if (this.form.resourceMap) {
              for (let key in this.form.resourceMap) {
                this.selectedResourceIds.push(...this.form.resourceMap[key]);
              }
            }

            this.spinning = false;
          })
          .catch(() => this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>